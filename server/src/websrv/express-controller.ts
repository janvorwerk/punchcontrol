import * as express from 'express';
const morgan = require('morgan');
import * as http from 'http';
import { Service } from 'typedi';
import { LOGGING } from '../util/logging';
import { DatabaseController } from '../db/database-controller';
import { ApiError, RestApiStatusCodes } from '@punchcontrol/shared/api';

const LOGGER = LOGGING.getLogger(__filename);


@Service()
export class ExpressContoller {

    server: http.Server;
    app: express.Application;
    port = 3000;
    host = 'localhost'; // listen only on localhost by default otherwise set 0.0.0.0 or...

    constructor(
        private databaseCtrl: DatabaseController) { }

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
    initialize(staticPath?: string): void {
        LOGGER.info(() => `Express server is starting up with static path = ${staticPath}`);
        this.app = express();
        this.app.use(express.json());
        // configure all 'access' logging
        this.app.use(morgan(':date[iso] :method :url :status - :remote-addr (:response-time ms)', {
            stream: LOGGING.logStream
        }));
        // serve static files
        if (staticPath) {
            this.app.use(express.static(staticPath));
        }

        // Check that database is open for all calls to /api/db/....
        const checkDatabaseOpenHandler: express.RequestHandler = (req, res, next) => {
            const connection = this.databaseCtrl.hasConnection;
            if (!connection) {
                const err: ApiError = { name: 'DatabaseError', message: `No database currently selected` };
                LOGGER.error(err.message);
                res.status(RestApiStatusCodes.SERVER_503_SERVICE_UNAVAILABLE).send(err);
            } else {
                next();
            }
        };
        this.app.use('/api/db/', checkDatabaseOpenHandler);

        // Error handling is LAST -- -not sure when this gets called with await/async handlers
        const clientErrorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
            LOGGER.error(() => `Unpexpected error in ${req.method} ${req.url}: ${err}`);
            if (req.xhr) {
                const e: ApiError = { name: 'InternalError', message: `Unexpected error: ${err}` };
                res.status(RestApiStatusCodes.SERVER_500_INTERNAL_SERVER_ERROR).send(e)
            } else {
                next(err)
            }
        }
        this.app.use(clientErrorHandler);

        this.server = http.createServer(this.app);
    }
}
