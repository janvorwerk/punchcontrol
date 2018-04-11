export type AppMode = 'STANDALONE' | 'MAIN' | 'SECONDARY';

export interface AppSettings {
    port: number;
    mode: AppMode;
    recentDatabases: string[];
    recentMasters: string[];
    chipReaders: {port: string, name?: string}[]
}
