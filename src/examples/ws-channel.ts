// import { wsChannel, WebSocketChannels } from 'works';

// const channel: WebSocketChannelFactory = (id: any) => id;

// interface Notification {
//   url: string, 
//   eventType: string, 
//   eventInfo?: string, 
//   username: string
// }

// function isNotificationForSite(_unitId: string, _unitType: string, _notification: Notification): boolean {
//   return true;
// }
// function isUserAuthorised(_user: any, _unitType: string, _unitId: string ): boolean {
//   return true;
// }

// const channels = {
//   'notification': wsChannel({
//     accessControl: (_user: any, {unitType, unitId}: {unitType: 'site' | 'team', unitId: string}) => isUserAuthorised(user, unitType, unitId),
//     select: ({unitType, unitId}: {unitType: 'site' | 'team', unitId: string}, payload: Notification) => isNotificationForSite(unitId, unitType, payload)
//   }),
// } 


// interface OtherChannels extends WebSocketChannelsTypeMap {
//   'site-wide-alert': {payload: string};
// }


// type WsChannels = WebSocketChannels<typeof channels> & OtherChannels;

// function emit<C extends keyof WsChannels>(_channel: C, _payload: WsChannels[C]['payload']): void {

// }

// emit('notification', {url: 'string', eventType: '', username: ''});
// emit('site-wide-alert', 'SOMETHING HAPPENED!');
