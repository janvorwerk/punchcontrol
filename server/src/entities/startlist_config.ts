import { AllowedClassCourse } from './allowed_class_course';
import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';


@Entity()
export class StartlistConfig {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("int", {
        nullable: false,
    })
    startTimestamp: Date;


    @Column("int", {
        nullable: false,
    })
    intervalS: number;


    @Column("int", {
        nullable: false,
    })
    minVacancyPct: number;


    @Column("int", {
        nullable: true,
    })
    corridorNumber: number;

    @OneToMany(type => AllowedClassCourse, allowedClassCourses => allowedClassCourses.startlistConfig)
    allowedClassCourses: AllowedClassCourse[];

}
