import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AllowedClassCourse } from './allowed_class_course';
import { Race } from './race';
import { IndividualRegistration } from './individual_registration';

export type Sex = 'M' | 'F' | 'M|F';

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
    allowedSex: Sex;


    @Column("int", {
        nullable: true,
    })
    minAge: number;


    @Column("int", {
        nullable: true,
    })
    maxAge: number;

    @OneToMany(type => AllowedClassCourse, allowedClassCourse => allowedClassCourse.individualClass)
    allowedClassCourses: AllowedClassCourse[];

    @ManyToOne(type => Race, race => race.individualClasses, {onDelete: 'CASCADE'})
    race: Race;

    @OneToMany(type => AllowedClassCourse, individualRegistration => individualRegistration.individualClass)
    individualRegistrations: IndividualRegistration[];
}
