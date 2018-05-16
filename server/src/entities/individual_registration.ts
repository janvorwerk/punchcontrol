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
import { IndividualClass } from './individual_class';


@Entity()
export class IndividualRegistration {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: true,
    })
    bib: string;


    @ManyToOne(type => Person, person => person.individualRegistrations, { onDelete: 'CASCADE' })
    person: Person;

    @ManyToOne(type => IndividualClass, individualClass => individualClass.individualRegistrations)
    individualClass: IndividualClass;


    @ManyToOne(type => CourseFamily, courseFamily => courseFamily.individualRegistrations)
    courseFamily: CourseFamily;

    @ManyToOne(type => ActualCourse, actualCourse => actualCourse.individualRegistrations)
    actualCourse: ActualCourse;
}
