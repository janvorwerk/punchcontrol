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
import { Sex, IndividualClass } from '../entities/individual_class';
import { CourseFamily } from '../entities/course_family';
import { IndividualRegistration } from '../entities/individual_registration';

const LOGGER = LOGGING.getLogger(__filename);

// Despite its name, this is not (yet!) a plugin...


const SEXES: { [x: string]: Sex } = {
    H: 'M',
    F: 'F', // women are sometimes D and sometimes F
    D: 'F'
}

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
}

class DatabaseWriter {
    private race: Race | undefined;
    private readonly organisations: Map<string, Organisation> = new Map();
    private readonly indivClasses: Map<string, IndividualClass> = new Map();
    private readonly teamClasses: Map<string, TeamClass> = new Map();

    constructor(private em: EntityManager, private data: string[][]) {
    }
    async init(raceId: number) {
        let races = await this.em.findByIds(Race, [raceId]);
        this.race = races[0];
    }
    async storeRelay(): Promise<number> {
        await this.storeOrganisations(8, 9);
        await this.storeTeamClasses();
        return await this.storeTeamsAndPersons();
    }
    async storeIndividual(): Promise<number> {
        await this.storeOrganisations(14, 15);
        await this.loadIndivClasses();
        return await this.storeIndividualRegistrations();
    }
    private async loadIndivClasses() {
        let indivClasses = await this.em.find(IndividualClass);
        for (let indivClass of indivClasses) {
            LOGGER.info(`Found indiv class ${indivClass.shortName}...`);
            this.indivClasses.set(indivClass.shortName, indivClass);
        }
    }

    private async storeOrganisations(shortNameCol: number, nameCol: number) {
        LOGGER.info(`Storing Organisation...`);
        let tmp = this.data.map(fields => [fields[shortNameCol], fields[nameCol]] as [string, string]);
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
    private async storeIndividualRegistrations(): Promise<number> {
        LOGGER.info(`Storing Team & TeamMember & Person...`);
        let runnersCount = 0;
        for (let fields of this.data) {
            let person = this.em.create(Person, {
                lastName: fields[3],
                firstName: fields[4],
                birthYear: FfcoUtils.getBirthYear(fields[5]),
                sex: SEXES[fields[6]],
                ecard: fields[1],
                externalKey: fields[2],
            });
            person = await this.em.findOne(Person, person) || await this.em.save(person);


            const classShortName = fields[18];
            const indivClass = this.indivClasses.get(classShortName);
            let courseFamily: CourseFamily|undefined = undefined;

            if (!indivClass) {
                // column must be a course name
                const courseFamRepo = this.em.getRepository(CourseFamily);
                courseFamily = await courseFamRepo.create({name: classShortName, race: this.race});
                courseFamily = await courseFamRepo.findOne(courseFamily) || await courseFamRepo.save(courseFamily);
            } else {
                // column is the real class name
            }
            const registrationRepo = this.em.getRepository(IndividualRegistration);
            let reg  = await registrationRepo.create({person, individualClass: indivClass, courseFamily});
            reg =  await registrationRepo.save(reg);
            runnersCount++;
        }
        return runnersCount;
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
                        sex: SEXES[fields[26 + 11 * i]],
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

async function generateOneClass(em: EntityManager, race: Race, sex: Sex, minAge: number, maxAge: number, shortName: string, longName: string = shortName): Promise<void> {
    let indivClass = em.create(IndividualClass, {
        shortName: shortName,
        race: race
    });
    indivClass = await em.findOne(IndividualClass, indivClass) || indivClass;
    // update fields as required
    indivClass.allowedSex = sex;
    indivClass.minAge = minAge;
    indivClass.maxAge = maxAge;
    indivClass.name = longName;
    await em.save(IndividualClass, indivClass);
}

export async function generateFfcoClasses(raceId: number, connection: Connection): Promise<number> {
    return await connection.transaction(async em => {
        const races = await em.findByIds(Race, [raceId]);
        const race = races[0];
        let generatedCount = 0;
        for (let sex of ['H', 'D']) {
            let ages = [10, 12, 14, 16, 18, 20];
            for (let index = 0; index < ages.length; index++) {
                const minAge = index === 0 ? 0 : ages[index - 1] + 1;
                const maxAge = ages[index];
                const shortName = `${sex}${maxAge}`;
                await generateOneClass(em, race, SEXES[sex], minAge, maxAge, shortName);
                generatedCount++;
            }
            ages = [21, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
            for (let index = 0; index < ages.length; index++) {
                const minAge = ages[index];
                const maxAge = index === ages.length - 1 ? 1000 : ages[index + 1] - 1;;
                const shortName = `${sex}${minAge}`;
                await generateOneClass(em, race, SEXES[sex], minAge, maxAge, shortName);
                generatedCount++;
            }
        }
        return generatedCount;
    });
}

export async function importFfcoRegistrationCsv(raceId: number, connection: Connection, csvContent: string): Promise<number> {
    const parseAsync = util.promisify<string, csvparse.Options, string[][]>(csvparse);
    const data = await parseAsync(csvContent, { delimiter: ';', rowDelimiter: '\r\n', relax_column_count: true });
    const headers = data[0];
    const isFfco = headers[0] === 'N° dép.';
    if (!isFfco) {
        throw new Error('Invalid file format');
    }
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
