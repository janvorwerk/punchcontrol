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
import { SrvDatabaseService } from '../db/database-service';
import { Race } from '../entities/race';
import { TeamMember } from '../entities/team_member';
import { importFccoRegistrationCsv } from '../util/ffcoparser';
import { LOGGING } from '../util/logging';
import { SrvExpressService } from './express-service';
import { SrvDatabaseApiService } from './generic-db-api';
import { SrvWebSocketService } from './websocket-service';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class SrvTeamMembersApiService {

    constructor(
        private databaseService: SrvDatabaseService,
        private expressService: SrvExpressService,
        private webSocketService: SrvWebSocketService,
        private databaseApi: SrvDatabaseApiService) { }

    async initialize() {
        const app = this.expressService.app;

        app.get("/api/db/teammembers", async (req: Request, res: Response) => {
            const cols = this.databaseApi.getColumns('TeamMember'); // TODO: filter with the actually requested columns
            const data = await this.databaseApi.queryForColumns(this.databaseService.connection, cols);
            res.status(RestApiStatusCodes.SUCCESS_200_OK).send(data);
        });
    }
}


