import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';
import { Application, Request, Response } from 'express';
import { Service } from 'typedi';
import { DatabaseController } from '../db/database.controller';
import { WebSocketController } from '../startup/websocket.controller';
import { LOGGING } from '../util/logging';
import { GenericApi } from './generic.api';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class TeamApi {

    constructor(
        private databaseCtrl: DatabaseController,
        private webSocketCtrl: WebSocketController,
        private genericApi: GenericApi) { }

    registerHandlers(app: Application): any {
        app.get('/api/generic/races/:raceId/teammembers', async (req: Request, res: Response) => {
            try {

                const raceId = parseInt(req.params.raceId)

                const cols = this.genericApi.getColumns('TeamMember'); // TODO: filter with the actually requested columns
                const data = await this.genericApi.queryForColumns(this.databaseCtrl.connection, cols, q => {
                    q.where("raceId = :raceId", { raceId });
                });
                res.status(RestApiStatusCodes.SUCCESS_200_OK).send(data);
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not get team members`, detail: `${e}` };
                LOGGER.error(err.short, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
    }
}


