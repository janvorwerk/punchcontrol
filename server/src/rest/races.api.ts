import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';
import { Application, Request, Response } from 'express';
import { Service } from 'typedi';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { DatabaseController } from '../db/database.controller';
import { Race } from '../entities/race';
import { RacingEvent } from '../entities/racing_event';
import { WebSocketController } from '../startup/websocket.controller';
import { readRequest } from '../util/http-util';
import { importIOFxml3Courses } from '../util/iof3_course_parser';
import { LOGGING } from '../util/logging';
import { GenericApi } from './generic.api';
import { importFfcoRegistrationCsv, generateFfcoClasses } from '../util/plugin_ffco';

const LOGGER = LOGGING.getLogger(__filename);

@Service()
export class RaceApi {

    constructor(
        private databaseCtrl: DatabaseController,
        private genericApi: GenericApi,
        private webSocketCtrl: WebSocketController) { }

    registerHandlers(app: Application): any {
        app.post('/api/races/:raceId/registration', async (req, res) => {
            // FIXME: check the Content-Type to see if we upload a file or create a single registration
            try {
                const raceId = parseInt(req.params.raceId)

                req.setEncoding('latin1'); // FIXME, this should be in the headers
                const content = await readRequest(req);
                const importedRunnersCount = await importFfcoRegistrationCsv(raceId, this.databaseCtrl.connection, content.toString());
                LOGGER.info(`Imported ${importedRunnersCount} runners OK`);
                res.status(RestApiStatusCodes.SUCCESS_200_OK).send({ importedRunnersCount });
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not import registration file`, detail: `${e}` };
                LOGGER.error(err.short, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });

        app.post('/api/races/:raceId/courses', async (req, res) => {
            // FIXME: check the Content-Type to see if we upload a file or create a single registration
            try {
                const raceId = parseInt(req.params.raceId)
                req.setEncoding('utf8'); // FIXME, this should be in the headers
                const content = await readRequest(req);
                const importedCoursesCount = await importIOFxml3Courses(raceId, this.databaseCtrl.connection, content);
                LOGGER.info(`Imported ${importedCoursesCount} courses OK`);
                res.status(RestApiStatusCodes.SUCCESS_200_OK).send({ importedCoursesCount });
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not import courses file`, detail: `${e}` };
                LOGGER.error(err.short, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });

        app.post('/api/races/:raceId/classes/generate', async (req, res) => {
            try {
                const raceId = parseInt(req.params.raceId);
                const generatedClassesCount = await generateFfcoClasses(raceId, this.databaseCtrl.connection);
                res.status(RestApiStatusCodes.SUCCESS_200_OK).send({generatedClassesCount});
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not generate classes`, detail: `${e}` };
                LOGGER.error(err.short, e);
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
                const races = await this.databaseCtrl.connection.getRepository(Race).find();
                this.webSocketCtrl.broadcast({ path: '/api/races', body: races })
                res.status(RestApiStatusCodes.SUCCESS_201_CREATED).send(race);
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not create race`, detail: `${e}` };
                LOGGER.error(err.short, e);
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
                const err: ApiError = { code: 'DatabaseError', short: `Could not get race`, detail: `${e}` };
                LOGGER.error(err.short, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
        app.delete("/api/races/:raceId", async (req: Request, res: Response) => {
            try {
                const raceId = parseInt(req.params.raceId)
                const repo = this.databaseCtrl.connection.getRepository(Race);
                const del = await repo.delete(raceId);
                LOGGER.info(() => `Deleted race #${raceId} OK: ${JSON.stringify(del)}`);
                const races = await this.databaseCtrl.connection.getRepository(Race).find();
                this.webSocketCtrl.broadcast({ path: '/api/races', body: races })
                res.status(RestApiStatusCodes.SUCCESS_204_NO_CONTENT).send();
            } catch (e) {
                const err: ApiError = { code: 'DatabaseError', short: `Could not delete race`, detail: `${e}` };
                LOGGER.error(err.short, e);
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(err);
            }
        });
        app.get('/api/generic/races', async (req: Request, res: Response) => {
            const cols = this.genericApi.getColumns('Races'); // TODO: filter with the actually requested columns
            const data = await this.genericApi.queryForColumns(this.databaseCtrl.connection, cols, q => { });
            res.status(RestApiStatusCodes.SUCCESS_200_OK).send(data);
        });

    }
}
