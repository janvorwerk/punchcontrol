import { getQueryParamsMap } from './queryparams';
import {
    LFService,
    LoggerFactory,
    LoggerFactoryOptions,
    LogGroupRule,
    LogLevel
    } from 'typescript-logging';

let logLevelString = getQueryParamsMap().get('log');
if (logLevelString) {
    sessionStorage.setItem('logLevel', logLevelString);
} else {
    logLevelString = sessionStorage.getItem('logLevel') || undefined;
}
logLevelString = logLevelString || 'error';
const LOG_LEVEL = LogLevel.fromString(logLevelString);

const DEFAULT_OPTIONS = new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp('.+'), LOG_LEVEL));
export const LOGGING = LFService.createNamedLoggerFactory('LoggerFactory', DEFAULT_OPTIONS);
