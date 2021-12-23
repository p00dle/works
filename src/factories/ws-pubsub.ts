import type { WebSocket, WebSocketServer } from 'ws';
import * as http from 'http';
import { UserError } from '../build-tools/action-wrapper';

import type { WsChannelPayload, WsChannels, WsClientMessage } from '../types/ws-channel';
import { isNonEmptyArray } from '../lib/utils';

function sendResponse(socket: any, httpStatusCode: number, message: string) {
  // @ts-ignore typings do not match
  const res = new http.ServerResponse({httpVersionMajor: 1, httpVersionMinor: 1});
  res.assignSocket(socket);
  res.on('finish', () => {
    res.detachSocket(socket); 
    socket.destroySoon();
  });
  res.writeHead(httpStatusCode, message);
  res.end();
}

export class WebSocketPubSub<T extends WsChannels> {
  private isConnectionLive: Map<WebSocket, boolean> = new Map();
  private subscribers: Partial<Record<keyof T, {socket: WebSocket, query: Record<string, any>}[]>> = {};
  private activeUserListeners: ((count: number) => any)[] = [];
  private wss: WebSocketServer | null = null
  private clientCount = 0;
  private channelMap: Partial<Record<keyof T, true>> = {}
  constructor(private channels: T) {
    for (const channel of Object.keys(this.channels) as (keyof T)[]) {
      this.channelMap[channel] = true;
      this.subscribers[channel] = [];
    }
  }
  private getWss(): WebSocketServer {
    if (this.wss === null) throw new UserError('Attempting to use WebSocket server before initialisation');
    return this.wss;
  }
  private parseClientMessage(data?: any): WsClientMessage<T> | null {
    const message = data ? JSON.parse(typeof data === 'string' ? data : data.toString()) : null;
    if (!message || !message.type || !message.channel || !this.channelMap[message.channel]) return null;
    return message;
  }
  public useServer(wss: WebSocketServer): this {
    this.wss = wss;
    wss.on('connection', socket => {
      this.publishActiveUsers();
      this.isConnectionLive.set(socket, true);
      socket.on('pong', () => this.isConnectionLive.set(socket, true));
      socket.on('message', (data: any) => this.handleClientMessage(socket, data));
      socket.on('close', this.boundPublishActiveUsers);
      socket.on('error', this.boundPublishActiveUsers);
    });
    
    setInterval(() => {
      try {
        for (const socket of this.getWss().clients) {
          if (!this.isConnectionLive.get(socket)) {
            socket.terminate();
          } else {
            this.isConnectionLive.set(socket, false);
            if (socket.readyState === 1) socket.ping();
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 10000);
    return this;
  }
  public getActiveUsersCount() {
    return this.clientCount;
  }
  public handleServerUpgradeEvent(server: http.Server, authenticationFunction: (req: http.IncomingMessage) => Promise<boolean> ): this {
    const wss = this.getWss();
    server.on('upgrade', async (req: http.IncomingMessage, socket: any, head: Buffer) => {
      try {
        if (await authenticationFunction(req)) {
          wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws));
        } else {
          sendResponse(socket, 401, 'Authentication required');
        }
      } catch (err) {
        sendResponse(socket, 500, 'Internal server error');
      }
    })
    return this;
  }
  private removeDeadSubscribers() {
    for (const channel of Object.keys(this.subscribers) as (keyof T)[]) {
      this.subscribers[channel] = this.subscribers[channel]?.filter(sub => sub.socket.readyState < 2) || [];
    }
  }
  public publish<C extends keyof T>({channel, payload}: {channel: C, payload: WsChannelPayload<T[C]>;}) {
    this.removeDeadSubscribers();
    let channelSubscribers = this.subscribers[channel];
    if (!isNonEmptyArray(channelSubscribers)) return;
    const select = this.channels[channel].select;
    if (typeof select === 'function') {
      for (const subscriber of channelSubscribers) {
        const selectedPayload = select(subscriber.query, payload);
        const messageStr = JSON.stringify({channel, payload: selectedPayload});
        subscriber.socket.send(messageStr);
      }
    } else {
      const messageStr = JSON.stringify({channel, payload});
      for (const subscriber of channelSubscribers) subscriber.socket.send(messageStr);
    }
  }
  public subscribeActiveUsers(listener: (count: number) => any) {
    this.activeUserListeners.push(listener);
  }
  public unsubscribeActiveUsers(listener: (count: number) => any) {
    const index = this.activeUserListeners.indexOf(listener);
    if (index >= 0) this.activeUserListeners.splice(index, 1);
  }
  private handleClientMessage(socket: WebSocket, data?: any) {
    const message = this.parseClientMessage(data);
    if (!message) return;
    const { channel, subscribe, query } = message;
    const channelSubscribers = this.subscribers[channel];
    if (!Array.isArray(channelSubscribers)) return;
    if (subscribe) {
      const index = channelSubscribers.findIndex(sub => sub.socket === socket);
      if (index >= 0) {
        channelSubscribers[index] = {socket, query};
      } else {
        channelSubscribers.push({socket, query});
      }
    } else {
      const index = channelSubscribers.findIndex(sub => sub.socket === socket);
      if (index >= 0) channelSubscribers.splice(index, 1);
    }
  }
  private publishActiveUsers() {
    this.clientCount = this.getWss().clients.size;
    this.activeUserListeners.forEach(fn => fn(this.clientCount));
  }
  private boundPublishActiveUsers = this.publishActiveUsers.bind(this); 
}


export function wsPubSubFactory(channels: WsChannels[]) {
  const combined: WsChannels = {};
  for (const kindChannels of channels) {
    for (const [route, channel] of Object.entries(kindChannels)) {
      combined[route] = channel;
    }
  }
  return new WebSocketPubSub(combined);
}