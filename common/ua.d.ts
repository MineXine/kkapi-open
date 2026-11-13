export interface ClientInfo {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    ua: string;
}
export declare function parseUserAgent(ua?: string): ClientInfo;
export declare function mergeClientInfo(ua: string, reported?: Partial<ClientInfo>): ClientInfo;
export declare function toPublicClientInfo(client?: ClientInfo | null): {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
};
