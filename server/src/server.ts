import { PatchDto } from '@punchcontrol/shared/patching';
import { PATCH_EL_RE, QUERY_EL_RE } from '@punchcontrol/shared/patching';
import { PersonDto } from '@punchcontrol/shared/person-dto';
import { ColumnDefinition, TableData } from '@punchcontrol/shared/table-data';
import { TeamMemberDto } from '@punchcontrol/shared/team-member-dto';
import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as http from 'http';
import { join as pathJoin } from 'path';
import 'reflect-metadata';
import { Connection, createConnection } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import * as util from 'util';
import * as WebSocket from 'ws';
import { CustomNamingStrategy } from './custom_naming_strategy';
import { openDatabase } from './dbconnection';
import { Race } from './entities/race';
import { TeamMember } from './entities/team_member';
import { importFccoRegistrationCsv } from './ffcoparser';

export async function startup(staticPath?: string) {
    const connection = await openDatabase();
    // TODO: the content should be uploaded from the browser
    const sampleDataPath = pathJoin(__dirname, '..', '..', '_sampledata', 'inscriptions1316.csv')
    const content = await util.promisify(fs.readFile)(sampleDataPath, 'latin1');
    await importFccoRegistrationCsv(connection, content);
    const app = express();
    app.use(bodyParser.json());
    if (staticPath) {
        app.use(express.static(staticPath));
    }

    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws: WebSocket) => {
        ws.on('message', (message: string) => {
            console.log(`websocket received ${message}`);
            const wsMsg: WebSocketMessage = JSON.parse(message);
            if (wsMsg.path === '/protocol/authorization') {
                const resp: WebSocketMessage = { path: '/protocol/authorization', body: 'fakecid' }
                ws.send(JSON.stringify(resp));
            }
        });
    });

    // Broadcast to all clients
    const broadcast = function broadcast(data: WebSocketMessage) {
        const str = JSON.stringify(data);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(str);
            }
        });
    };

    app.get("/api/races", async (req: Request, res: Response) => {
        const races = await connection.getRepository(Race).find();
        res.send(races);
    });
    app.get("/api/tm", async (req: Request, res: Response) => {
        const colDefs: ColumnDefinition[] = [
            {
                header: 'Team bib',
                id: 'bib',
                el: 'TeamMember.team>team.bib',
                patchEl: 'Team#teamId.bib',
            },
            {
                header: 'Runner sub-bib',
                id: 'bibSubnum',
                el: 'TeamMember.bibSubnum',
                display: {
                    readonly: true
                }
            },
            {
                header: 'Team name',
                id: 'teamName',
                el: 'TeamMember.team>team.name',
                patchEl: 'Team#teamId.name'
            },
            {
                header: 'First name',
                id: 'firstName',
                el: 'TeamMember.person>person.firstName',
                patchEl: 'Person#personId.firstName',
            },
            {
                header: 'Last name',
                id: 'lastName',
                el: 'TeamMember.person>person.lastName',
                patchEl: 'Person#personId.lastName',
            },
            {
                id: 'personId',
                el: 'TeamMember.person>person.id',
                display: {
                    readonly: true,
                    hidden: true
                }
            },
            {
                header: 'Sex',
                id: 'sex',
                el: 'TeamMember.person>person.sex',
                patchEl: 'Person#personId.sex',
            },
            {
                header: 'E-card',
                id: 'ecard',
                el: 'TeamMember.person>person.ecard',
                patchEl: 'Person#personId.ecard',
            },
            {
                header: 'External key',
                id: 'externalKey',
                el: 'TeamMember.person>person.externalKey',
                patchEl: 'Person#personId.externalKey',
                display: {
                    readonly: true
                }
            },
            {
                id: 'teamId',
                el: 'TeamMember.team>team.id',
                display: {
                    readonly: true,
                    hidden: true
                }
            }
        ];
        let data = await queryForColumns(connection, colDefs);
        res.send(data);
    });
    app.patch("/api/patch", async (req: Request, res: Response) => {
        try {
            const patches: PatchDto[] = req.body;
            await connection.transaction(async em => {

                for (const p of patches) {
                    const match = p.patchEl.match(PATCH_EL_RE.re);
                    if (!match) {
                        console.log(`Patch EL error ${p.patchEl} - ignoring`);
                    } else {
                        const entity = PATCH_EL_RE.getField(match, 'entity');
                        const field = PATCH_EL_RE.getField(match, 'field');
                        const repo = em.getRepository(entity);
                        const dbEntity: any = await repo.findOneOrFail(p.id);
                        if (dbEntity[field] !== p.oldVal) {
                            const message = `Concurrent modification for ${entity}#${p.id}: expecting ${p.oldVal} found ${dbEntity[field]}`
                            console.error(message)
                            throw new Error(message);
                        }
                        const part: DeepPartial<any> = {};
                        part[field] = p.newVal;
                        const ret = await repo.update(p.id, part);
                        console.log(`Patch returned ${JSON.stringify(ret)}`);
                    }
                }
            });
            broadcast({ path: '/data/update', body: patches })
            res.send({ 'hello': 1 }); // TODO: remove
        } catch (e) {
            res.status(500).send(e);
        }
    });
    app.get('/api/whoami', (req, res) => {
        const person: PersonDto = { firstName: 'Jan', lastName: 'Vorwerk' };
        res.send(person);
    });

    server.listen(3000, () => {
        console.log('Example app listening on port 3000!');
    });
}

interface QueryColumn {
    entity: string;
    field: string;
    relation?: string;
    id: string;
    isRelation: boolean
}

async function queryForColumns(connection: Connection, columns: ColumnDefinition[]): Promise<TableData> {
    // the hidden columns should only be displayed at the end!
    columns = [
        ...columns.filter(col => !(col.display && col.display.hidden)),
        ...columns.filter(col => (col.display && col.display.hidden))
    ]
    const parsedCols = columns.map(col => {
        const match = col.el.match(QUERY_EL_RE.re);
        if (match) {
            const entity = QUERY_EL_RE.getField(match, 'entity');
            const relation = QUERY_EL_RE.getField(match, 'relation');
            const field = QUERY_EL_RE.getField(match, 'field');
            const ret: QueryColumn = { entity, relation, field, id: col.id, isRelation: QUERY_EL_RE.has(match, 'relation') };
            return ret;
        }
    }).filter(col => !!col) as QueryColumn[];

    const entities = [...new Set(parsedCols.map(cols => cols.entity))];
    if (entities.length > 1) {
        console.error(`Mismatch in entity types in column definitions: found ${entities}`)
    }
    const joins = [...new Set(parsedCols.filter(col => col.isRelation).map(cols => cols.field))];

    const builder = connection.createQueryBuilder(entities[0], 'entity');
    joins.forEach(j => builder.leftJoin(`entity.${j}`, j));
    parsedCols.forEach(col => {
        if (col.isRelation) {
            builder.addSelect(`${col.relation}`, col.id);
        } else {
            builder.addSelect(`entity.${col.field}`, col.id);
        }
    });
    const result = await builder.getRawMany();
    const data: TableData = { columns: columns, rows: result.slice(1).map(line => columns.map(col => line[col.id])) }
    return data;
}
