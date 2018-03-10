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
import { Person } from './person';
import { CourseFamily } from './course_family';


@Entity()
export class IndividualRegistration {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: true,
    })
    bib: string;


    @ManyToOne(type => Person, person => person.individualRegistrations)
    person: Person;



    @ManyToOne(type => AllowedClassCourse, individualClass => individualClass.individualRegistrations)
    individualClass: AllowedClassCourse;


    @ManyToOne(type => CourseFamily, courseFamily => courseFamily.individualRegistrations)
    courseFamily: CourseFamily;

    @ManyToOne(type => ActualCourse, actualCourse => actualCourse.individualRegistrations)
    actualCourse: ActualCourse;
}
