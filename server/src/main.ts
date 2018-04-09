import * as fs from 'fs';
import * as os from 'os';
import { join as pathJoin } from 'path';
import 'reflect-metadata';
import { LogLevel } from 'typescript-logging';
import { LOGGING } from './util/logging';

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
 */
export async function main(staticPath: string) {
    const configure = require('./configure'); // do not import prior to logs init!
    configure.startup(APP_FOLDER, staticPath);
}

// Check if this is the main module (we are not started from Electron)
if (!module.parent) {
    initLogs();
    const LOGGER = LOGGING.getLogger(__filename);

    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });

    const root = pathJoin(__dirname, '..', '..');
    const staticPath = pathJoin(root, 'client', 'dist');
    main(staticPath)
        .then(() => LOGGER.debug(`Server started`))
        .catch((err: Error) => LOGGER.error(() => `${err}`));
}
