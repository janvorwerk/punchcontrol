import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';
import { Application, Request, Response } from 'express';
import { Service } from 'typedi';
import { DatabaseController } from '../db/database.controller';
import { SettingsController } from '../startup/settings.controller';
import { WebSocketController } from '../startup/websocket.controller';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger(__filename);

/**
 * The admin controller should only be accessed locally
 * and allows opening databases, creating users & passwords
 * etc...
 */
@Service()
export class AdminApi {

    constructor(
        private databaseCtrl: DatabaseController,
        private webSocketCtrl: WebSocketController,
        private settingsMgr: SettingsController) { }

    registerHandlers(app: Application): void {
        app.post('/api/admin/database', async (req: Request, res: Response) => {
            try {
                const dbPath = req.body.path;
                await this.databaseCtrl.openSqliteDatabase(dbPath);
                res.status(RestApiStatusCodes.SUCCESS_204_NO_CONTENT).send();
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not open database`, detail: `${e}` };
                LOGGER.error(err.short);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
        app.get('/api/admin/settings', (req, res) => {
            const settings = this.settingsMgr.export(); // TODO: filter out useless or sensitive stuff
            res.status(RestApiStatusCodes.SUCCESS_200_OK).send(settings);
        });
        app.post('/api/admin/settings', (req, res) => {
            const settings = this.settingsMgr.import(req.body);
            res.status(RestApiStatusCodes.SUCCESS_204_NO_CONTENT).send();
        });
    }
}
