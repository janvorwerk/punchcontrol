import { ActualCourse } from './actual_course';
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
import { Control } from './control';


@Entity()
export class CourseControl {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("int", {
        nullable: true,
    })
    seqNum: number;


    @Column("int", {
        nullable: true,
    })
    score: number;


    @Column("int", {
        nullable: true,
    })
    legLengthM: number;



    @ManyToOne(type => Control, control => control.courseControls)
    control: Control;


    @ManyToOne(type => ActualCourse, actualCourse => actualCourse.courseControls)
    actualCourse: ActualCourse;

}
