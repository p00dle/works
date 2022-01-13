// @works-lock-file:false

/** @internal */
export interface AuthenticationLog {
    uuid: string;
    timestamp: number;
    username: string;
    success: boolean;
    ipAddress: string;
}