export type AppMode = 'STANDALONE' | 'MAIN' | 'SECONDARY';

export type LoggingLevel = 'Trace' | 'Debug' | 'Info' | 'Warn' | 'Error' | 'Fatal';

export interface AppSettings {
    port: number;
    mode: AppMode;
    recentDatabases: string[];
    recentMasters: string[];
    chipReaders: {port: string, name?: string}[];
    logLevel: LoggingLevel;

}
