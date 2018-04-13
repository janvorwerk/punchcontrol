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
import { CourseControl } from './course_control';
import { CourseFamily } from './course_family';
import { IndividualRegistration } from './individual_registration';
import { TeamMember } from './team_member';


@Entity()
export class ActualCourse {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: false,
    })
    name: string;


    @Column("int", {
        nullable: true,
    })
    lengthM: number;


    @Column("int", {
        nullable: true,
    })
    climbM: number;

    @ManyToOne(type => CourseFamily, courseFamily => courseFamily.actualCourses, { onDelete: 'CASCADE' })
    courseFamily: CourseFamily;



    @OneToMany(type => CourseControl, courseControls => courseControls.actualCourse)
    courseControls: CourseControl[];



    @OneToMany(type => IndividualRegistration, individualRegistrations => individualRegistrations.actualCourse)
    individualRegistrations: IndividualRegistration[];



    @OneToMany(type => TeamMember, teamMembers => teamMembers.actualCourse)
    teamMembers: TeamMember[];

}
