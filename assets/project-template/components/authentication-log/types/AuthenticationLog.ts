// @works-lock-file:false

/** @internal */
export interface AuthenticationLog {
    uuid: string;
    timestamp: number;
    username: string;
    success: boolean;
    ipAddress: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
}