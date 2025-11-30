interface AuthInfo {
    userId: string;
    apiKeyId: string;
}
declare module 'express-serve-static-core' {
    interface Request {
        auth?: AuthInfo;
    }
}
export {};
//# sourceMappingURL=index.d.ts.map