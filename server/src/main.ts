import * as fs from 'fs';
import { join as pathJoin } from 'path';
import 'reflect-metadata';
import { LogLevel } from 'typescript-logging';
import { LOGGING } from './util/logging';


/**
 * Init the logs so that we can log the server startup
 *
 * @param workFolder where the ./logs folder should be created
 */
export function initLogs(workFolder: string) {
    LOGGING.initialize(LogLevel.Info, workFolder, true);
    const LOGGER = LOGGING.getLogger(__filename);
    LOGGER.info(() => `Logging to ${workFolder} initialized`);
    return LOGGING;
}

/**
 * The main entry point
 * @param staticPath where the static web resources are located
 */
export async function main(staticPath: string) {
    const configure = require('./configure'); // do not import prior to logs init!
    configure.startup(staticPath);
}

// Check if this is the main module (we are not started from Electron)
if (!module.parent) {
    const root = pathJoin(__dirname, '..', '..');
    initLogs(root);
    const LOGGER = LOGGING.getLogger(__filename);

    process.on('unhandledRejection', (reason, p) => {
        LOGGER.fatal(() => `Unhandled Rejection at:'${p}: ${reason}`);
    });

    const staticPath = pathJoin(root, 'client', 'dist');
    main(staticPath)
        .then(() => LOGGER.debug(`Server started`))
        .catch((err: Error) => LOGGER.error(() => `${err}`));
}
