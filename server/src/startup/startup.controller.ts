import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import { join as pathJoin } from 'path';
import { Container, Service } from 'typedi';
import { useContainer } from 'typeorm';
import { LOGGING } from '../util/logging';
import { ExpressController } from './express.controller';
import { WebSocketController } from './websocket.controller';
import { SettingsController } from './settings.controller';
import { AuthController } from './auth.controller';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
class StartupController {
    constructor(private expressCtrl: ExpressController,
        private settingsCtrl: SettingsController,
        private authCtrl: AuthController) {
    }
    async initialize(appFolder: string, staticPath: string, secret: string) {
        // Init settings first so that other can use
        await this.settingsCtrl.initialize(appFolder);
        this.authCtrl.initialize(secret);
        this.expressCtrl.initialize(staticPath);
        this.expressCtrl.startListening();
    }
}

/**
 * Startup the server (both in Electron or standalone modes).
 *
 * @param appFolder is ~/.punchcontrol
 * @param staticPath the path where all static resources can be found
 */
export async function startup(appFolder: string, staticPath: string, secret: string) {
    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });

    const startupMgr = Container.get<StartupController>(StartupController);
    try {
        await startupMgr.initialize(appFolder, staticPath, secret);
    } catch(e) {
        LOGGER.fatal(() => `Could not startup app: ${e}`);
    }
}

