import * as fs from 'fs';
import * as os from 'os';
import { join as pathJoin } from 'path';
import 'reflect-metadata';
import { LogLevel } from 'typescript-logging';
import { LOGGING } from './util/logging';
import * as minimist from 'minimist';

const APP_FOLDER = pathJoin(os.homedir(), '.punchcontrol');

function ensureFolder(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

/**
 * Init the logs so that we can log the server startup
 */
export function initLogs() {
    ensureFolder(APP_FOLDER); // create the app folder if it does not exist
    LOGGING.initialize(LogLevel.Info, APP_FOLDER, true);
    const LOGGER = LOGGING.getLogger(__filename);
    LOGGER.info(() => `Logging to ${APP_FOLDER}/logs initialized`);
    return LOGGING;
}

/**
 * The main entry point
 * @param staticPath where the static web resources are located
 * @param secret random string which will be given to both web client
 *     and server on startup to make sure that the client is really the page
 *     embedded in the Electron App, which grants full admin priviledge.
 */
export async function main(staticPath: string, secret: string) {
    const startupCtrl = require('./startup/startup.controller'); // do not import prior to logs init!
    await startupCtrl.startup(APP_FOLDER, staticPath, secret);
}

// Check if this is the main module (we are not started from Electron)
if (!module.parent) {
    initLogs();
    const LOGGER = LOGGING.getLogger(__filename);
    const args = minimist(process.argv);
    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });
    const secret = args.dev ? 'fakesecret' : '';
    LOGGER.info(`Starting server with dev=${args.dev}`)
    const root = pathJoin(__dirname, '..', '..');
    const staticPath = pathJoin(root, 'client', 'dist');
    main(staticPath, secret)
        .then(() => LOGGER.debug(`Server started`))
        .catch((err: Error) => LOGGER.error(() => `${err}`));
}
