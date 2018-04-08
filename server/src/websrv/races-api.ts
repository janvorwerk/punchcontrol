import { Request, Response } from 'express';
import { Service } from 'typedi';
import { DatabaseController } from '../db/database-controller';
import { Race } from '../entities/race';
import { ExpressContoller } from './express-controller';
import { importFccoRegistrationCsv } from '../util/ffcoparser';
import { WebSocketController } from './websocket-controller';
import { LOGGING } from '../util/logging';
import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';
import { readRequest } from '../util/http-util';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class RacesApiController {

    constructor(
        private databaseCtrl: DatabaseController,
        private expressCtrl: ExpressContoller,
        private webSocketCtrl: WebSocketController) { }

    async initialize() {
        const app = this.expressCtrl.app;

        app.post('/api/db/races/:raceId/registration', async (req, res) => {
            // FIXME: check the Content-Type to see if we upload a file or create a single registration
            try {
                req.setEncoding('latin1');
                const content = await readRequest(req);
                const importedRunnersCount = await importFccoRegistrationCsv(this.databaseCtrl.connection, content);
                LOGGER.info(`Imported ${importedRunnersCount} runners OK`);
                res.status(RestApiStatusCodes.SUCCESS_200_OK).send({ importedRunnersCount });
            } catch (e) {
                const err: ApiError = { name: 'InternalError', message: `Import error: ${e}` };
                LOGGER.error(err.message, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });

        app.get("/api/db/races", async (req: Request, res: Response) => {
            const races = await this.databaseCtrl.connection.getRepository(Race).find();
            res.status(RestApiStatusCodes.SUCCESS_200_OK).send(races);
        });

    }
}
