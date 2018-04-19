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
import { Race } from './race';


@Entity()
export class Control {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: false,
    })
    controlCode: string;


    @Column("text", {
        nullable: false,
    })
    controlType: string;

    @ManyToOne(type => Race, race => race.controls, { onDelete: 'CASCADE' })
    race: Race;

    @Column("int", {
        nullable: false,
    })
    isRadio: number;


    @Column("text", {
        nullable: true,
    })
    name: string;

    @OneToMany(type => CourseControl, courseControls => courseControls.control)
    courseControls: CourseControl[];

}
