import { Request } from 'express';

export function readRequest(req: Request): Promise<any> {
    return new Promise((res, rej) => {
        req.on('readable', () => {
            const content = req.read();
            res(content);
        });
        req.on('abort', () => {
            rej('aborted');
        });
        req.on('timeout', () => {
            rej('timeout');
        });
    });
}


