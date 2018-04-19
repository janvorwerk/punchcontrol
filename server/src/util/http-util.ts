import { Request } from 'express';

export function readRequest(req: Request): Promise<Buffer> {
    let buffer = new Buffer('');
    return new Promise((res, rej) => {
        req.on('data', (chunch) => {
            if (!Buffer.isBuffer(chunch)) {
                chunch = new Buffer(chunch);
            }
            buffer = Buffer.concat([buffer, chunch]);
        });
        req.on('end', () => {
            res(buffer);
        });
        req.on('abort', () => {
            rej('aborted');
        });
        req.on('timeout', () => {
            rej('timeout');
        });
    });
}


