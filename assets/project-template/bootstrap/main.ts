import { wsServerFactory } from 'works';
import { httpServer } from '~/bootstrap/http-server';
import { port } from '~/bootstrap/global-env-vars';
import { sessionParser } from '~/bootstrap/session-parser';
import { wsPubSub } from '~/bootstrap/ws-pubsub';

httpServer.listen(port, () => console.info(`Server ready at port ${port}`));
const wsServer = wsServerFactory({httpServer, sessionParser});
wsPubSub.useServer(wsServer);
