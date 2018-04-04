import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import { Container, Service } from 'typedi';
import { useContainer } from 'typeorm';
import { SrvExpressService } from './websrv/express-service';
import { SrvApiConfiguratorService } from './websrv/api-service';
import { SrvWebSocketService } from './websrv/websocket-service';
import { LOGGING } from './util/logging';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class SrvConfigureSercice {
    constructor(private express: SrvExpressService,
        private webSocket: SrvWebSocketService,
        private rest: SrvApiConfiguratorService) {
    }
    async initialize(staticPath?: string) {
        this.express.initialize(staticPath);
        this.webSocket.initialize();
        this.rest.initialize();
    }
}

/**
 * Startup the server (both in Electron or standalone modes).
 *
 * @param staticPath the path where all static resources can be found
 */
export async function startup(staticPath?: string) {
    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });

    const config = Container.get<SrvConfigureSercice>(SrvConfigureSercice);
    config.initialize(staticPath);
}

