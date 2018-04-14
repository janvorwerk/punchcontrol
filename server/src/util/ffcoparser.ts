import * as csvparse from 'csv-parse';
import * as fs from 'fs';
import { connect } from 'http2';
import { Session } from 'inspector';
import { createConnection } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import * as util from 'util';
import { CustomNamingStrategy } from '../db/custom_naming_strategy';
import { Organisation } from '../entities/organisation';
import { Person } from '../entities/person';
import { Race } from '../entities/race';
import { RacingEvent } from '../entities/racing_event';
import { Team } from '../entities/team';
import { TeamClass } from '../entities/team_class';
import { TeamMember } from '../entities/team_member';
import { TeamMemberClass } from '../entities/team_member_class';
import { LOGGING } from './logging';

const LOGGER = LOGGING.
getLogger(__filename);

class FfcoUtils {
    private static readonly CENTURY_SWAP_YEAR = new Date().getFullYear() - 2000;
    static getBirthYear(twoDigitsyear: string): number {
        let year: number = parseInt(twoDigitsyear);
        if (year < FfcoUtils.CENTURY_SWAP_YEAR) {
            year += 2000;
        }
        else {
            year += 1900;
        }
        return year;
    }
    static getSex(fr: string) {
        return fr === 'H' ? 'M' : 'F';
    }
}

class DatabaseWriter {
    private race: Race | undefined;
    private readonly organisations: Map<string, Organisation> = new Map();
    private readonly teamClasses: Map<string, TeamClass> = new Map();

    constructor(private em: EntityManager, private data: string[][]) {
    }
    async init(raceId: number) {
        let races = await this.em.findByIds(Race, [raceId]);
        this.race = races[0];
    }
    async storeRelay(): Promise<number> {
        await this.storeOrganisations();
        await this.storeTeamClasses();
        return await this.storeTeamsAndPersons();
    }
    async storeIndividual(): Promise<number> {
        throw new Error('not implemented');
    }

    private async storeOrganisations() {
        LOGGER.info(`Storing Organisation...`);
        let tmp = this.data.map(fields => [fields[8], fields[9]] as [string, string]);
        const orgs = new Map<string, string>(Array.from(tmp));
        const repoOrganisation = this.em.getRepository(Organisation);
        for (const [shortName, name] of orgs) {
            let org = await repoOrganisation.create({ name: name, shortName: shortName });
            org = await repoOrganisation.findOne(org) || await repoOrganisation.save(org);
            this.organisations.set(shortName, org);
        }
    }

    private async storeTeamClasses() {
        LOGGER.info(`Storing TeamClass & TeamMemberClass...`);
        const tmp = this.data.map(
            fields => [fields[12], { name: fields[13], count: fields[14] }] as [string, { name: string, count: string }]
        );
        const teamClasses = new Map<string, { name: string, count: string }>(Array.from(tmp));
        for (const [shortName, { name, count }] of teamClasses) {

            let teamClass = this.em.create(TeamClass, {
                race: this.race,
                shortName: shortName,
                name: name
            });

            const newLocal = await this.em.findOne(TeamClass, {
                race: this.race,
                shortName: shortName,
                name: name
            });

            teamClass = newLocal || await this.em.save(TeamClass, teamClass);
            this.teamClasses.set(shortName, teamClass);

            const relayersCount = parseInt(count);

            for (let i = 0; i < relayersCount; ++i) {
                let tmClass = this.em.create(TeamMemberClass, {
                    teamClass: teamClass,
                    startOrder: i + 1,
                    allowedSex: 'M|F'
                });
                tmClass = await this.em.findOne(TeamMemberClass, tmClass) || await this.em.save(TeamMemberClass, tmClass);
            }
        }
    }

    private async storeTeamsAndPersons(): Promise<number> {
        LOGGER.info(`Storing Team & TeamMember & Person...`);
        let runnersCount = 0;
        for (let fields of this.data) {
            const teamClassName = fields[12];
            const teamClass = this.teamClasses.get(teamClassName);
            if (!teamClass) {
                throw new Error(`Could not find TeamClass ${teamClassName}`)
            }
            let team = this.em.create(Team, {
                race: this.race,
                name: fields[1],
                organisation: this.organisations.get(fields[8]),
                teamClass: teamClass
            });
            team = await this.em.findOne(Team, team) || await this.em.save(Team, team);

            const relayersCount = parseInt(fields[14]); // could not get it from TeamClass

            for (let i = 0; i < relayersCount; ++i) {
                let teamMembClass = await this.em.findOne(TeamMemberClass, { teamClass: teamClass, startOrder: i + 1 });
                let person: Person | undefined = undefined;
                const lastName = fields[23 + 11 * i];
                // there might be a 'hole' in the team
                if (lastName) {
                    person = this.em.create(Person, {
                        lastName: lastName,
                        firstName: fields[24 + 11 * i],
                        birthYear: FfcoUtils.getBirthYear(fields[25 + 11 * i]),
                        sex: FfcoUtils.getSex(fields[26 + 11 * i]),
                        ecard: fields[31 + 11 * i],
                        externalKey: fields[33 + 11 * i],
                    });
                    person = await this.em.findOne(Person, person) || await this.em.save(person);
                }

                let tm = this.em.create(TeamMember, {
                    team: team,
                    bibSubnum: i + 1,
                    memberClass: teamMembClass
                });
                tm = await this.em.findOne(TeamMember, tm) || tm;
                if (person) {
                    tm.person = person;
                }
                await this.em.save(TeamMember, tm);
                runnersCount++;
            }
        }
        return runnersCount;
    }
}


export async function importFccoRegistrationCsv(raceId: number, connection: Connection, csvContent: string): Promise<number> {
    const parseAsync = util.promisify<string, csvparse.Options, string[][]>(csvparse);
    const data = await parseAsync(csvContent, { delimiter: ';', rowDelimiter: '\r\n', relax_column_count: true });
    const headers = data[0];
    const isRelay = headers[14] === 'Relayeurs';

    const importedRunners = await connection.transaction(async transactionalEntityManager => {
        const dbwriter = new DatabaseWriter(transactionalEntityManager, data.slice(1));
        await dbwriter.init(raceId);
        if (isRelay) {
            return await dbwriter.storeRelay();
        } else {
            return await dbwriter.storeIndividual();
        }
    });
    return importedRunners
}

// /** for testing */
// async function main(targetRaceId: number, filename: string) {
//     const connection = await openDatabase();
//     const content = await util.promisify(fs.readFile)(filename, 'latin1');
//     await importFccoRegistrationCsv(connection, content);
// }

// if (!module.parent) { // only if running this module for testing
//     main(1, '/home/jan/code/punchcontrol/_sampledata/inscriptions1316.csv')
//         .then(() => LOGGER.info(`Done`))
//         .catch((err: Error) => LOGGER.error(err));
// }
