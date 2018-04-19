import * as fs from 'fs';
import {
    AbstractLogger,
    LFService,
    LoggerFactory,
    LoggerFactoryOptions,
    LogGroupRule,
    LogLevel,
    LogMessage,
    LogFormat,
    LoggerType,
    ConsoleLoggerImpl,
    Logger
} from 'typescript-logging';
import * as util from 'util';
import * as path from 'path';
const rfs = require('rotating-file-stream');

/**
 * Extending the ConsoleLoggerImpl seems the only way to log both to a file
 * and to the console
 */
class CustomLogger extends ConsoleLoggerImpl {

    constructor(name: string, settings: any, private logFile: fs.WriteStream | null, private toConsole: boolean) {
        super(name, settings);
    }

    protected doLog(msg: LogMessage): void {
        if (this.toConsole) {
            super.doLog(msg);
        }
        if (this.logFile) {
            const str = this.createDefaultLogMessage(msg) + '\n';
            this.logFile.write(str);
        }
    }
}

class MyLoggerFactory {
    logStream: fs.WriteStream;
    private _factory: LoggerFactory;

    initialize(logLevel: LogLevel, rootPath: string, toConsole: boolean) {
        const logsFolder = path.join(rootPath, 'logs');
        fs.existsSync(logsFolder) || fs.mkdirSync(logsFolder);

        // create a rotating write stream for logs
        this.logStream = rfs('punchcontrol.log', {
            size:     '10M', // rotate every 10 MegaBytes written
            interval: '1d',  // rotate daily
            compress: 'gzip', // compress rotated files
            path: logsFolder
        });
        const options = new LoggerFactoryOptions();
        options.addLogGroupRule(
            new LogGroupRule(
                new RegExp('.+'),
                logLevel,
                new LogFormat(),
                LoggerType.Custom,
                (name: string, settings: any) => {
                    return new CustomLogger(name, settings, this.logStream, toConsole);
                }
            )
        );
        this._factory = LFService.createNamedLoggerFactory('LoggerFactory', options);
    }
    get factory() {
        if (this._factory) {
            return this._factory;
        } else {
            // This is to be able to call LOGGER w/o prior initialization
            // for instance while starting a module out of the app
            const options = new LoggerFactoryOptions();

            options.addLogGroupRule(
                new LogGroupRule(
                    new RegExp('.+'),
                    LogLevel.Info,
                    new LogFormat(),
                    LoggerType.Console
                )
            );
            return LFService.createNamedLoggerFactory('LoggerFactory', options);
        }
    }
    getLogger(fullPath: string) {
        const basename = path.basename(fullPath, '.js');
        return this.factory.getLogger(basename);
    }
}

export const LOGGING = new MyLoggerFactory();
