import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import { join as pathJoin } from 'path';
import { Container, Service } from 'typedi';
import { useContainer } from 'typeorm';
import { LOGGING } from './util/logging';
import { ApiConfiguratorController } from './websrv/api-controller';
import { ExpressContoller } from './websrv/express-controller';
import { WebSocketController } from './websrv/websocket-controller';
import { SettingsManager } from './settings.ctrl';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
class StartupManager {
    constructor(private expressCtrl: ExpressContoller,
        private webSocketCtrl: WebSocketController,
        private apiCtrl: ApiConfiguratorController,
        private settingsMgr: SettingsManager) {
    }
    async initialize(appFolder: string, staticPath?: string) {
        // Init settings first so that other can use
        await this.settingsMgr.initialize(appFolder);
        await this.expressCtrl.initialize(staticPath);
        await this.webSocketCtrl.initialize();
        await this.apiCtrl.initialize();
    }
}

/**
 * Startup the server (both in Electron or standalone modes).
 *
 * @param appFolder is ~/.punchcontrol
 * @param staticPath the path where all static resources can be found
 */
export async function startup(appFolder: string, staticPath?: string) {
    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });

    const startupMgr = Container.get<StartupManager>(StartupManager);
    try {
        await startupMgr.initialize(appFolder, staticPath);
    } catch(e) {
        LOGGER.fatal(() => `Could not startup app: ${e}`);
    }
}

