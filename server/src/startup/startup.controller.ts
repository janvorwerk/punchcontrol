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
import { DatabaseController } from '../db/database.controller';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
class StartupController {
    constructor(private expressCtrl: ExpressController,
        private settingsCtrl: SettingsController,
        private authCtrl: AuthController,
        private databaseCtrl: DatabaseController) {
    }
    async initialize(appFolder: string, staticPath: string, secret: string, options: any) {
        // Init settings first so that other can use
        await this.settingsCtrl.initialize(appFolder);

        // FIXME: how do I update the log level for all loggers?
        // this.settingsCtrl.logLevel;
        // LOGGER.

        if (options.dev) {
            // in dev mode, we need to open the latest DB on startup
            // so that live reload is functional, otherwise the
            // user will chose on welcome screen
            this.databaseCtrl.openSqliteDatabase(this.settingsCtrl.recentDatabases[0]);
        }
        this.authCtrl.initialize(secret);
        this.expressCtrl.initialize(staticPath);
        if (options.dev) {
            // in dev mode, we need to start listening for the same
            // reason as the DB
            this.expressCtrl.startListening();
        }
    }
}

/**
 * Startup the server (both in Electron or standalone modes).
 *
 * @param appFolder is ~/.punchcontrol
 * @param staticPath the path where all static resources can be found
 */
export async function startup(appFolder: string, staticPath: string, secret: string, options: any) {
    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });

    const startupMgr = Container.get<StartupController>(StartupController);
    try {
        await startupMgr.initialize(appFolder, staticPath, secret, options);
    } catch(e) {
        LOGGER.fatal(() => `Could not startup app: ${e}`);
    }
}

