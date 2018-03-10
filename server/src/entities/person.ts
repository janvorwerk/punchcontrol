import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { IndividualRegistration } from './individual_registration';
import { Organisation } from './organisation';
import { PersonResult } from './person_result';
import { TeamMember } from './team_member';


@Entity()
export class Person {


    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: true,
    })
    externalKey: string;


    @Column("text", {
        nullable: true,
    })
    ecard: string;


    @Column("text", {
        nullable: true,
    })
    firstName: string;


    @Column("text", {
        nullable: true,
    })
    lastName: string;


    @Column("text", {
        nullable: true,
    })
    sex: string;


    @Column("int", {
        nullable: true,
    })
    birthYear: number;


    @Column("int", {
        nullable: true,
    })
    overallDuration: number;


    @Column("int", {
        nullable: true,
    })
    overallScore: number;



    @ManyToOne(type => Organisation, organisation => organisation.persons)
    organisation: Organisation | undefined;



    @OneToMany(type => IndividualRegistration, individualRegistrations => individualRegistrations.person)
    individualRegistrations: IndividualRegistration[];



    @OneToMany(type => PersonResult, personResults => personResults.person)
    personResults: PersonResult[];



    @OneToMany(type => TeamMember, teamMembers => teamMembers.person)
    teamMembers: TeamMember[];

}
