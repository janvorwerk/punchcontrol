import { Connection } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { Parser } from 'xml2js';
import { ActualCourse } from '../entities/actual_course';
import { Control } from '../entities/control';
import { CourseControl } from '../entities/course_control';
import { CourseFamily } from '../entities/course_family';
import { Race } from '../entities/race';
import { LOGGING } from './logging';


const LOGGER = LOGGING.getLogger(__filename);

// ========== GENERATED CLASSES ======
// Those classes are not generated from the XSD but from a sample
// (could not find a decent/alive XML parsing lib using the XSD!)
interface IofV3Data {
    CourseData: IofCourseData;
}

interface IofCourseData {
    '$': IofCourseDataAttr;
    Event: Event[];
    RaceCourseData: IofRaceCourseData[];
}

interface IofRaceCourseData {
    MapData?: IofMap[];
    Control: IofControl[];
    Course: IofCourse[];
    TeamCourseAssignment?: IofTeamCourseAssignment[];
    ClassCourseAssignment?: IofClassCourseAssignment[];
}

interface IofClassCourseAssignment {
    ClassName: string[];
    CourseName: string[];
}

interface IofTeamCourseAssignment {
    BibNumber: string[];
    TeamMemberCourseAssignment: IofTeamMemberCourseAssignment[];
}

interface IofTeamMemberCourseAssignment {
    Leg: string[];
    CourseName: string[];
    CourseFamily: string[];
}

interface IofCourse {
    Name: string[];
    CourseFamily?: string[];
    Length: string[];
    Climb: string[];
    CourseControl: IofCourseControl[];
}

interface IofCourseControl {
    '$': IofCourseControlAttr;
    Control: string[];
    LegLength?: string[];
}

interface IofCourseControlAttr {
    type: string;
}

interface IofControl {
    Id: string[];
    MapPosition: IofMapPositionTopLeft[];
}

interface IofMap {
    Scale: string[];
    MapPositionTopLeft: IofMapPositionTopLeft[];
    MapPositionBottomRight: IofMapPositionTopLeft[];
}

interface IofMapPositionTopLeft {
    '$': IofMapPositionTopLeftAttr;
}

interface IofMapPositionTopLeftAttr {
    x: string;
    y: string;
    unit: string;
}

interface Event {
    Name: string[];
}

interface IofCourseDataAttr {
    xmlns: string;
    'xmlns:xsi': string;
    iofVersion: string;
    createTime: string;
    creator: string;
}
// ========== END OF GENERATED CLASSES ======

async function parseBuffer(content: Buffer): Promise<IofV3Data> {
    return new Promise<IofV3Data>((res, rej) => {
        const parser = new Parser();
        parser.parseString(content, (err: string, result: any) => {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });
    });
}

class DatabaseWriter {
    private race: Race;
    private controls: Map<string, Control> = new Map();
    private families: Map<string, CourseFamily> = new Map();

    constructor(private em: EntityManager, private courseData: IofCourseData) { }
    async init(raceId: number) {
        let races = await this.em.findByIds(Race, [raceId]);
        this.race = races[0];
    }
    async store(): Promise<number> {
        await this.storeBibs();
        await this.storeFamilies();
        await this.storeControls();
        return await this.storeActualCourses();
    }
    async storeBibs() {
        const assignments = this.courseData.RaceCourseData[0].TeamCourseAssignment;
        if (assignments) {
            const bibs = assignments.map( ass => {
                return {
                    bib: ass.BibNumber[0],
                    combinations: ass.TeamMemberCourseAssignment
                        .map(membAss => ({ leg: parseInt(membAss.Leg[0]), actualCourse: membAss.CourseName[0]}))
                };
            });
            const bibsJson = JSON.stringify(bibs);
            this.race.bibCourseAssignment = bibsJson;
            LOGGER.info(`Storing course bib assignment...`);
            await this.em.save(this.race);
        }
    }
    async storeFamilies() {
        LOGGER.info(`Storing course families...`);
        const families = this.courseData.RaceCourseData[0].Course
            .map(course => {
                if (!course.CourseFamily) {
                    course.CourseFamily = course.Name;
                }
                return course.CourseFamily[0];
            });
        const repo = this.em.getRepository(CourseFamily);
        for(const familyName of families) {
            let family = await repo.create({name: familyName, race: this.race});
            family = await repo.findOne(family) || await repo.save(family);
            this.families.set(familyName, family);
        }
    }
    async storeControls() {
        LOGGER.info(`Storing race controls...`);
        const types = new Map<string, string>();
        this.courseData.RaceCourseData[0].Course.forEach(c => {
            c.CourseControl.forEach(cc => {
                types.set(cc.Control[0], cc.$.type);
            })
        })
        const controls = this.courseData.RaceCourseData[0].Control;
        const repo = this.em.getRepository(Control);
        for(let c of controls) {
            const controlCode = c.Id[0];
            let ctrl = await repo.create({controlCode, race: this.race});
            const found = await repo.findOne(ctrl);
            if (found) {
                ctrl = found;
            } else {
                ctrl.isRadio = 0;
                ctrl.controlType = types.get(controlCode) || 'unknown';
                ctrl = await repo.save(ctrl);
            }
            this.controls.set(ctrl.controlCode, ctrl);
        }
    }
    async storeActualCourses(): Promise<number> {
        LOGGER.info(`Storing courses...`);
        const courses = this.courseData.RaceCourseData[0].Course;
        const courseRepo = this.em.getRepository(ActualCourse);
        const controlRepo = this.em.getRepository(CourseControl);
        for (let c of courses) {
            const familyName = (c.CourseFamily as string[])[0];
            const family = this.families.get(familyName);
            let actualCourse = await courseRepo.create({name: c.Name[0], courseFamily: family});
            const foundActCourse = await courseRepo.findOne(actualCourse);
            if (foundActCourse) {
                actualCourse = foundActCourse;
            } else {
                actualCourse.lengthM = parseInt(c.Length[0]);
                actualCourse.climbM = parseInt(c.Climb[0]);
                await courseRepo.save(actualCourse);
            }
            for (let seqNum = 0; seqNum < c.CourseControl.length; seqNum++) {
                const cc = c.CourseControl[seqNum];
                const control = this.controls.get(cc.Control[0]);
                let courseCtrl = await controlRepo.create({seqNum, actualCourse, control});
                const foundCtrl = await controlRepo.findOne(courseCtrl);
                if (foundCtrl) {
                    courseCtrl = foundCtrl;
                } else {
                    if (cc.LegLength) {
                        courseCtrl.legLengthM = parseInt(cc.LegLength[0]);
                    }
                    courseCtrl = await controlRepo.save(courseCtrl);
                }
            }
        }
        return courses.length;
    }
}

export async function importIOFxml3Courses(raceId: number, connection: Connection, content: Buffer): Promise<number> {
    const obj = await parseBuffer(content);
    if (obj.CourseData.$.iofVersion !== '3.0') {
        throw new Error('unsupported format'); // FIXME
    }
    return await connection.transaction(async transactionalEntityManager => {
        const dbwriter = new DatabaseWriter(transactionalEntityManager, obj.CourseData);
        await dbwriter.init(raceId);
        return await dbwriter.store();
    });
}

