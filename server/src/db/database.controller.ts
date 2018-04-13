import { Service } from 'typedi';
import { createConnection } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { CustomNamingStrategy } from './custom_naming_strategy';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { join as pathJoin } from 'path';
import { Observable } from 'rxjs/Observable';
import { SettingsController } from '../startup/settings.controller';
import * as fs from 'fs';
import { RacingEvent } from '../entities/racing_event';
import { Race } from '../entities/race';

const loggerOption: LoggerOptions = ['error'] //, 'query']

enum BackendDatabase {
    SQLITE, POSTGRES
}

const COMMON = {
    // synchronize: true,
    // dropSchema: true,
    logging: loggerOption,
    namingStrategy: new CustomNamingStrategy(),
    entities: [
        pathJoin(__dirname, '..', 'entities/*.js')
    ],
};

const POSTGRES: PostgresConnectionOptions = {
    ...COMMON,
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "!Passw0rd",
    database: "punchcontrol"
}

export interface Database {
    connection: Connection;
    backend: BackendDatabase;
    path?: string; // only for SQLite
}

async function openSqliteDatabase(options: SqliteConnectionOptions) {
    return await createConnection(options);
}
async function openPostgresDatabase() {
    return await createConnection(POSTGRES);
}

@Service()
export class DatabaseController {

    private _connection = new BehaviorSubject<Database | null>(null);

    constructor(private settingsCtrl: SettingsController) { }

    async openSqliteDatabase(path: string) {
        const isNewDb = !fs.existsSync(path);
        const options: SqliteConnectionOptions = {
            ...COMMON,
            type: 'sqlite',
            database: path,
            logging: ['error', 'query']
        };
        let connection = await openSqliteDatabase(options);
        if (isNewDb) {
            // TODO: by the time Punchcontrol goes into production grade,
            // I hope the TypeORM migration generation will be functionnal
            // with all databases, especially SQLite.
            await connection.synchronize();
            // if this was a new file, create default content (an event and a race)
            // to avoir the user the burden for doing it
            await createDefaultContent(connection);
        }
        this._connection.next({ connection, backend: BackendDatabase.SQLITE, path });
    }

    async connectToPostgresDatabase() {
        let connection: Connection = await openPostgresDatabase();
        this._connection.next({ connection, backend: BackendDatabase.POSTGRES });
    }

    get hasConnection(): boolean {
        return this._connection.getValue() !== null;
    }

    get database(): Observable<Database | null> {
        return this._connection.asObservable();
    }

    get connection(): Connection {
        const db = this._connection.getValue();
        if (db === null) {
            throw new Error('No open database');
        }
        return db.connection;
    }
}


async function createDefaultContent(connection: Connection) {
    await connection.transaction(async em => {
        let event = em.create(RacingEvent, { name: 'Default event' });
        event = await em.save(event);
        let race = em.create(Race, { name: 'Race', racingEvent: event, form: 'FIXME', startMode: 'FIXME' });
        race = await em.save(race);
    });
}
