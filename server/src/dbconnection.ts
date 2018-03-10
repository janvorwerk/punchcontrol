import { Connection } from 'typeorm/connection/Connection';
import { createConnection } from 'typeorm';
import { CustomNamingStrategy } from './custom_naming_strategy';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

const loggerOption: LoggerOptions = ['error'] //, 'query']

enum BackendDatabase {
    SQLITE, POSTGRES
}

const BACKEND = BackendDatabase.SQLITE; // edit if needed

const COMMON = {
    // uncomment if needed - /!\ bug with SQLite: drop and generate does not work: rm the file
    synchronize: true,
    dropSchema: true,
    logging: loggerOption,
    namingStrategy: new CustomNamingStrategy(),
    entities: [
        __dirname + "/entities/*.js"
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

export async function openDatabase() {
    if (BACKEND === BackendDatabase.SQLITE) {
        return await openSqliteDatabase();
    } else {
        return await openPostgresDatabase();
    }
}

async function openSqliteDatabase() {
    return await createConnection(SQLITE);
}
async function openPostgresDatabase() {
    return await createConnection(POSTGRES);
}
