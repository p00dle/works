import { wsPubSub } from '~/bootstrap/ws-pubsub'
import { registerClientTelemetryWsListener } from '~/components/user-telemetry-log/client-ws-listener';

[
  registerClientTelemetryWsListener,
].forEach(register => register(wsPubSub));
