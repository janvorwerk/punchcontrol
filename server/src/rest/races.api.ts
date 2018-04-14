import { Request, Response, Application } from 'express';
import { Service } from 'typedi';
import { DatabaseController } from '../db/database.controller';
import { Race } from '../entities/race';
import { ExpressController } from '../startup/express.controller';
import { importFccoRegistrationCsv } from '../util/ffcoparser';
import { WebSocketController } from '../startup/websocket.controller';
import { LOGGING } from '../util/logging';
import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';
import { readRequest } from '../util/http-util';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { RacingEvent } from '../entities/racing_event';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class RaceApi {

    constructor(
        private databaseCtrl: DatabaseController,
        private webSocketCtrl: WebSocketController) { }

    registerHandlers(app: Application): any {
        app.post('/api/races/:raceId/registration', async (req, res) => {
            // FIXME: check the Content-Type to see if we upload a file or create a single registration
            try {
                const raceId = parseInt(req.params.raceId)

                req.setEncoding('latin1'); // FIXME, this should be in the headers
                const content = await readRequest(req);
                const importedRunnersCount = await importFccoRegistrationCsv(raceId, this.databaseCtrl.connection, content);
                LOGGER.info(`Imported ${importedRunnersCount} runners OK`);
                res.status(RestApiStatusCodes.SUCCESS_200_OK).send({ importedRunnersCount });
            } catch (e) {
                const err: ApiError = { name: 'InternalError', message: `Import error: ${e}` };
                LOGGER.error(err.message, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });

        app.get("/api/races", async (req: Request, res: Response) => {
            const races = await this.databaseCtrl.connection.getRepository(Race).find();
            res.status(RestApiStatusCodes.SUCCESS_200_OK).send(races);
        });
        app.post("/api/races", async (req: Request, res: Response) => {
            try {
                const eventRepo = this.databaseCtrl.connection.getRepository(RacingEvent);
                let event = await eventRepo.findOne();

                const repo = this.databaseCtrl.connection.getRepository(Race);
                let params: DeepPartial<Race> = req.body;
                params.racingEvent = event;
                let race = repo.create(params);
                race = await repo.save(race);
                LOGGER.info(() => `Created race OK: ${JSON.stringify(race)}`);
                res.status(RestApiStatusCodes.SUCCESS_201_CREATED).send(race);
            } catch (e) {
                const err: ApiError = { name: 'InternalError', message: `Could not create race: ${e}` };
                LOGGER.error(err.message, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
        app.get("/api/races/:raceId", async (req: Request, res: Response) => {
            try {
                const raceId = parseInt(req.params.raceId)
                const repo = this.databaseCtrl.connection.getRepository(Race);
                const races = await repo.findByIds([raceId]);
                if (races.length === 0) {
                    LOGGER.warn(() => `Not found race #${raceId}`);
                    res.status(RestApiStatusCodes.CLIENT_404_NOT_FOUND).send();
                } else {
                    const race = races[0];
                    LOGGER.info(() => `Found race #${raceId} OK: ${JSON.stringify(race)}`);
                    res.status(RestApiStatusCodes.SUCCESS_200_OK).send(race);
                }
            } catch (e) {
                const err: ApiError = { name: 'InternalError', message: `Could not delete race: ${e}` };
                LOGGER.error(err.message, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
        app.delete("/api/races/:raceId", async (req: Request, res: Response) => {
            try {
                const raceId = parseInt(req.params.raceId)
                const repo = this.databaseCtrl.connection.getRepository(Race);
                await repo.delete(raceId);
                LOGGER.info(() => `Deleted race #${raceId} OK`);
                res.status(RestApiStatusCodes.SUCCESS_204_NO_CONTENT).send();
            } catch (e) {
                const err: ApiError = { name: 'InternalError', message: `Could not delete race: ${e}` };
                LOGGER.error(err.message, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
    }
}
