import * as express from 'express';
const morgan = require('morgan');
import * as http from 'http';
import { Service } from 'typedi';
import { LOGGING } from '../util/logging';
import { DatabaseController } from '../db/database.controller';
import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';
import { AuthController } from './auth.controller';
import { RequestHandler } from 'express';
import { join as pathJoin } from 'path';
import { AdminApi } from '../rest/admin.api';
import { GenericApi } from '../rest/generic.api';
import { RaceApi } from '../rest/races.api';
import { TeamApi } from '../rest/team.api';
import { WebSocketController } from './websocket.controller';

const LOGGER = LOGGING.getLogger(__filename);


@Service()
export class ExpressController {

    server: http.Server;
    app: express.Application;
    port = 3000;
    host = 'localhost'; // listen only on localhost by default otherwise set 0.0.0.0 or...

    constructor(
        private databaseCtrl: DatabaseController,
        private authCtrl: AuthController,
        private adminApi: AdminApi,
        private genericApi: GenericApi,
        private raceApi: RaceApi,
        private teamApi: TeamApi,
        private webSocketCtrl: WebSocketController
    ) {
    }

    /**
     * Once configured, start listening to connections
     */
    startListening(): any {
        this.server.listen(this.port, this.host, () => {
            LOGGER.info(`server listening on port ${this.host}:${this.port}!`);
        });
    }
    /**
     * Initialize the web server
     * @param staticPath where the static resources are located
     */
    initialize(staticPath: string) {
        LOGGER.info(() => `Express server is starting up with static path = ${staticPath}`);
        this.app = express();

        this.app.use(express.json());
        // configure all 'access' logging
        this.app.use(morgan(':date[iso] :method :url :status - :remote-addr (:response-time ms)', {
            stream: LOGGING.logStream
        }));
        // serve static files
        this.app.use(express.static(staticPath));

        // // Check that database is open for all calls to /api/db/....
        // const checkDatabaseOpenHandler: express.RequestHandler = (req, res, next) => {
        //     const connection = this.databaseCtrl.hasConnection;
        //     if (!connection) {
        //         const err: ApiError = { name: 'DatabaseError', message: `No database currently selected` };
        //         LOGGER.error(err.message);
        //         res.status(RestApiStatusCodes.SERVER_503_SERVICE_UNAVAILABLE).send(err);
        //     } else {
        //         next();
        //     }
        // };
        // this.app.use('/api/db/', checkDatabaseOpenHandler);

        // Register all routes
        this.authCtrl.registerHandlers(this.app)
        this.adminApi.registerHandlers(this.app);
        this.genericApi.registerHandlers(this.app);
        this.raceApi.registerHandlers(this.app);
        this.teamApi.registerHandlers(this.app);

        // filter to respond with root html page for HTML5 push-state URLs
        this.app.use((req, res, next) => {
            if (
                req.url.startsWith('/api') || // API
                req.url.startsWith('/ws') ||  // WebSocket
                req.url.includes('.')         // a regular file .css, .svg etc...
            ) {
                next(); // let other routes handle
            } else {
                res.status(RestApiStatusCodes.SUCCESS_200_OK);
                res.sendFile(pathJoin(staticPath, 'index.html'), { url: req.url });
            }
        });

        this.server = http.createServer(this.app);
        this.webSocketCtrl.initialize(this.server);
    }
}
