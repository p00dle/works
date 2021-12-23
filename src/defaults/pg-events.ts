import { Client } from 'pg';
import { isNonEmptyArray } from '../lib/utils';

async function createTable(pg: Client) {
  await pg.query(`
    CREATE TABLE IF NOT EXISTS "works_pubsub" (
      "id" SERIAL,
      "channel" text NOT NULL,
      "payload" jsonb
    );`);
}

async function createTriggerFunction(pg: Client) {
  await pg.query(`
    CREATE OR REPLACE FUNCTION works_notify_trigger() RETURNS trigger AS $$
    DECLARE
    BEGIN
      PERFORM pg_notify('works_pubsub', row_to_json(NEW)::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER works_pubsub_insert
      AFTER INSERT ON "works_pubsub"
      FOR EACH ROW
      EXECUTE PROCEDURE works_notify_trigger();  
    `)
  
}

class PubSub {
  private connection: Client | null = null;
  private initiated = false;
  private initiating = false;
  private waitForInitiateFns: [(...args: any[]) => void, (...args: any[]) => void][] = [];
  private isError = false;
  private listeners: {[channel: string]: ((payload: any) => void | Promise<void>)[]} = {};
  constructor(private databaseUrl: string) {}
  public async emit(channel: string, payload: any) {
    const pg = await this.connect();
    await pg.query(`INSERT INTO "works_pubsub" (channel, payload) VALUES ($1, $2);`, [channel, JSON.stringify(payload)]);
  }
  public addEventListener(channel: string, listener: (payload: any) => void | Promise<void>) {
    this.connect();
    if (this.listeners[channel] === undefined) this.listeners[channel] = [];
    this.listeners[channel].push(listener);
  }
  public removeEventListener(channel: string, listener: (payload: any) => void | Promise<void>) {
    if (this.listeners[channel] === undefined || !Array.isArray(this.listeners[channel])) return;
    const index = this.listeners[channel].findIndex(fn => fn === listener);
    if (index >= 0) {
      this.listeners[channel].splice(index, 1);
    }
  }
  private async connect(): Promise<Client> {
    if (this.isError) throw Error('Connection not initiated due to an error');
    if (this.initiated) return this.connection as Client;
    if (this.initiating) return new Promise((resolve, reject) => this.waitForInitiateFns.push([resolve, reject]));
    try {
      this.initiating = true;
      const connection = new Client(this.databaseUrl);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await connection.connect();
      await connection.query('LISTEN works_pub_sub');
      // @ts-ignore no typings for notification event
      connection.on('notification', async (message: {channel: string, payload: string}) => {
        if (message.channel !== 'works_pub_sub') return;
        const payloadData = JSON.parse(message.payload) as {id: number, channel: string, payload: any};
        const { id, channel, payload } = payloadData;
        if (isNonEmptyArray(this.listeners[channel])) {
          this.listeners[channel].forEach(fn => fn(payload));
        } 
        await connection.query('DELETE FROM events WHERE id = $1', [id]);
      });
      await createTable(connection);
      await createTriggerFunction(connection);
      this.connection = connection;
      this.waitForInitiateFns.forEach(([resolve]) => resolve());
      this.waitForInitiateFns = [];
      this.initiating = false;
      this.initiated = true;
      return connection;
    } catch (err) {
      this.isError = true;
      this.waitForInitiateFns = [];
      this.initiating = false;
      this.initiated = true;
      this.waitForInitiateFns.forEach(([, reject]) => reject());
      throw err;
    } 
  }
  
}

export const pgEventsFactory = (databaseUrl: string) => new PubSub(databaseUrl);