import type { WebSocketPubSub } from 'works';
import type { UserTelemetryLog } from './types';

import { addUserTelemetryLog } from './queries';

function validateMessage(message: unknown): message is UserTelemetryLog {
  return typeof message === 'object' && message !== null && 
    'uuid' in message &&
    'type' in message;

}

function handleWsClientMessage(message: any) {
  if (validateMessage(message)) addUserTelemetryLog(undefined, message);
}

export function registerClientTelemetryWsListener(ws: WebSocketPubSub<any>) {
  ws.subscribe('user-telemetry', handleWsClientMessage);
}
