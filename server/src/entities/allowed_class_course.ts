import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryColumn
    } from 'typeorm';
import { CourseFamily } from './course_family';
import { IndividualClass } from './individual_class';
import { IndividualRegistration } from './individual_registration';
import { StartlistConfig } from './startlist_config';


@Entity()
@Index("pk_allowed_class_course", ["courseFamily", "individualClass"], { unique: true })
export class AllowedClassCourse {

    @ManyToOne(type => IndividualClass, individualClass => individualClass.allowedClassCourses, {
        primary: true,
        eager: true /* eager because primary */,
        nullable: false
    })
    individualClass: IndividualClass;


    @ManyToOne(type => CourseFamily, courseFamily => courseFamily.allowedClassCourses, {
        primary: true,
        eager: true /* eager because primary */,
        nullable: false
    })
    courseFamily: CourseFamily;


    @Column("int", {
        nullable: false,
    })
    hasBibs: number;


    @Column("int", {
        nullable: false,
    })
    isRanked: number;


    @Column("int", {
        nullable: false,
    })
    isTimed: number;


    @ManyToOne(type => StartlistConfig, startlistConfig => startlistConfig.allowedClassCourses)
    startlistConfig: StartlistConfig;

    @OneToMany(type => IndividualRegistration, individualRegistrations => individualRegistrations.individualClass)
    individualRegistrations: IndividualRegistration[];

}
