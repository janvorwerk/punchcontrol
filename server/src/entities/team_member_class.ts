import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { CourseFamily } from './course_family';
import { TeamClass } from './team_class';
import { TeamMember } from './team_member';


@Entity()
export class TeamMemberClass {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("int", {
        nullable: false,
    })
    startOrder: number;



    @ManyToOne(type => TeamClass, teamClass => teamClass.teamMemberClasses, { onDelete: 'CASCADE' })
    teamClass: TeamClass;



    @ManyToOne(type => CourseFamily, courseFamily => courseFamily.teamMemberClasses, { onDelete: 'SET NULL' })
    courseFamily: CourseFamily;


    /** M|F */
    @Column("text", {
        nullable: false,
    })
    allowedSex: string;


    @Column("int", {
        nullable: true,
    })
    minAge: number;


    @Column("int", {
        nullable: true,
    })
    maxAge: number;


    @OneToMany(type => TeamMember, teamMembers => teamMembers.memberClass)
    teamMembers: TeamMember[];

}
