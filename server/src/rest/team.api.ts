import { RestApiStatusCodes } from '@punchcontrol/shared/api';
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
import { importFccoRegistrationCsv } from '../util/ffcoparser';
import { LOGGING } from '../util/logging';
import { ExpressContoller } from '../startup/express.controller';
import { GenericApi } from './generic.api';
import { WebSocketController } from '../startup/websocket.controller';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class TeamApi {

    constructor(
        private databaseCtrl: DatabaseController,
        private expressCtrl: ExpressContoller,
        private webSocketCtrl: WebSocketController,
        private databaseApiCtrl: GenericApi) { }

    async initialize() {
        const app = this.expressCtrl.app;

        app.get("/api/db/teammembers", async (req: Request, res: Response) => {
            const cols = this.databaseApiCtrl.getColumns('TeamMember'); // TODO: filter with the actually requested columns
            const data = await this.databaseApiCtrl.queryForColumns(this.databaseCtrl.connection, cols);
            res.status(RestApiStatusCodes.SUCCESS_200_OK).send(data);
        });
    }
}


