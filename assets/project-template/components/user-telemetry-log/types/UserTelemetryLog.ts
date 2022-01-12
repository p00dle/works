// @works-lock-file:false

/** @internal */
export interface UserTelemetryLog {
  uuid: string;
  type: string;
  username: string | null;
  path: string | null;
  timestamp: number;
  interval: number;
  details: any | null;
}
