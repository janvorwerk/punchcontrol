import { PatchDto } from '@punchcontrol/shared/patching';
import { PATCH_EL_RE, QUERY_EL_RE } from '@punchcontrol/shared/patching';
import { PersonDto } from '@punchcontrol/shared/person-dto';
import { CellType, ColumnDefinition, TableData } from '@punchcontrol/shared/table-data';
import { TeamMemberDto } from '@punchcontrol/shared/team-member-dto';
import { Request, Response } from 'express';
import { Service } from 'typedi';
import { Connection } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { DatabaseController } from '../db/database.controller';
import { Race } from '../entities/race';
import { TeamMember } from '../entities/team_member';
import { ExpressController } from '../startup/express.controller';
import { importFccoRegistrationCsv } from '../util/ffcoparser';
import { WebSocketController } from '../startup/websocket.controller';
import { LOGGING } from '../util/logging';
import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';
import { SettingsController } from '../startup/settings.controller';
import { Application } from 'express';

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
