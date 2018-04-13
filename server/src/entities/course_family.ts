import { ActualCourse } from './actual_course';
import { AllowedClassCourse } from './allowed_class_course';
import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Race } from './race';
import { TeamMemberClass } from './team_member_class';
import { IndividualRegistration } from './individual_registration';


@Entity()
export class CourseFamily {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: false,
    })
    name: string;



    @ManyToOne(type => Race, race => race.courseFamilies, { onDelete: 'CASCADE' })
    race: Race;


    @Column("text", {
        nullable: true,
    })
    displayColor: string;



    @OneToMany(type => AllowedClassCourse, allowedClassCourse => allowedClassCourse.courseFamily)
    allowedClassCourses: AllowedClassCourse[];


    @OneToMany(type => ActualCourse, actualCourses => actualCourses.courseFamily)
    actualCourses: ActualCourse[];


    @OneToMany(type => TeamMemberClass, teamMemberClasses => teamMemberClasses.courseFamily)
    teamMemberClasses: TeamMemberClass[];

    @OneToMany(type => IndividualRegistration, individualRegistrations => individualRegistrations.actualCourse)
    individualRegistrations: IndividualRegistration[];
}
