export type AppMode = 'STANDALONE' | 'MAIN' | 'SECONDARY';

export interface AppSettings {
    port: number;
    mode: AppMode;
    recents: string[];
    masterUrl: string|null;
    chipReaders: {port: string, name?: string}[]
}
