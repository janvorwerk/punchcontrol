import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
    } from 'typeorm';
import { Person } from './person';
import { Team } from './team';


@Entity()
export class Organisation {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: false,
    })
    name: string;


    @Column("text", {
        nullable: false,
    })
    shortName: string;


    @OneToMany(type => Person, persons => persons.organisation)
    persons: Person[];


    @OneToMany(type => Team, teams => teams.organisation)
    teams: Team[];
}
