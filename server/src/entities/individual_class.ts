import { AllowedClassCourse } from './allowed_class_course';
import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Race } from './race';


@Entity()
export class IndividualClass {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: false,
    })
    shortName: string;


    @Column("text", {
        nullable: true,
    })
    name: string;


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


    @ManyToOne(type => Race, race => race.individualClasses, {onDelete: 'CASCADE'})
    race: Race;



    @OneToMany(type => AllowedClassCourse, allowedClassCourse => allowedClassCourse.individualClass)
    allowedClassCourses: AllowedClassCourse[];

}
