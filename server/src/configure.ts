import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import { Container, Service } from 'typedi';
import { useContainer } from 'typeorm';
import { ExpressContoller } from './websrv/express-controller';
import { ApiConfiguratorController } from './websrv/api-controller';
import { WebSocketController } from './websrv/websocket-controller';
import { LOGGING } from './util/logging';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class SrvConfigureSercice {
    constructor(private expressCtrl: ExpressContoller,
        private webSocketCtrl: WebSocketController,
        private apiCtrl: ApiConfiguratorController) {
    }
    async initialize(staticPath?: string) {
        this.expressCtrl.initialize(staticPath);
        this.webSocketCtrl.initialize();
        this.apiCtrl.initialize();
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

