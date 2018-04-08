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

const loggerOption: LoggerOptions = ['error'] //, 'query']

enum BackendDatabase {
    SQLITE, POSTGRES
}

const BACKEND = BackendDatabase.SQLITE; // edit if neede

const COMMON = {
    synchronize: true,
    dropSchema: true,
    logging: loggerOption,
    namingStrategy: new CustomNamingStrategy(),
    entities: [
        pathJoin(__dirname, '..',  'entities/*.js')
    ],
};

const SQLITE: SqliteConnectionOptions = {
    ...COMMON,
    type: "sqlite",
    database: "/tmp/myevent.punch"
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

async function openSqliteDatabase() {
    return await createConnection(SQLITE);
}
async function openPostgresDatabase() {
    return await createConnection(POSTGRES);
}

@Service()
export class SrvDatabaseService {

    private _connection = new BehaviorSubject<Connection|null>(null);

    constructor() {}

    async openDatabase() {
        let conn: Connection;
        if (BACKEND === BackendDatabase.SQLITE) {
            conn = await openSqliteDatabase();
        } else {
            conn = await openPostgresDatabase();
        }
        this._connection.next(conn);
    }

    get hasConnection(): boolean {
        return this._connection.getValue() !== null;
    }

    get connection(): Connection {
        const conn = this._connection.getValue();
        if (conn === null) {
            throw new Error('No open database');
        }
        return conn;
    }
}
