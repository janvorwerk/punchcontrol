import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { CourseFamily } from './course_family';
import { IndividualClass } from './individual_class';
import { PersonResult } from './person_result';
import { RacingEvent } from './racing_event';
import { Team } from './team';
import { TeamClass } from './team_class';


@Entity()
export class Race {


    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text", {
        nullable: false,
    })
    name: string;

    @ManyToOne(type => RacingEvent, racing_event => racing_event.races, {onDelete: 'CASCADE'})
    racingEvent: RacingEvent;

    @Column("text", {
        nullable: false,
    })
    form: string;


    @Column("text", {
        nullable: false,
    })
    startMode: string;


    @Column("integer", {
        nullable: true,
    })
    startTimestamp: Date;


    @Column("text", {
        nullable: true,
    })
    bibCourseAssignment: string;


    @OneToMany(type => IndividualClass, individualClasses => individualClasses.race)
    individualClasses: IndividualClass[];



    @OneToMany(type => CourseFamily, courseFamilies => courseFamilies.race)
    courseFamilies: CourseFamily[];



    @OneToMany(type => PersonResult, personResults => personResults.race)
    personResults: PersonResult[];



    @OneToMany(type => TeamClass, teamClasses => teamClasses.race)
    teamClasses: TeamClass[];

    @OneToMany(type => Team, teams => teams.race)
    teams: Team[];
}
