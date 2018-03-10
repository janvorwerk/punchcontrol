import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
    } from 'typeorm';
import { Person } from './person';
import { Race } from './race';
import { SplitTime } from './split_time';


@Entity()
export class PersonResult {


    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("text", {
        nullable: false,
    })
    status: string;


    @Column("text", {
        nullable: true,
    })
    ecard: string;


    @Column("integer", {
        nullable: true,
    })
    startTimestamp: Date;


    @Column("integer", {
        nullable: true,
    })
    endTimestamp: Date;


    @Column("int", {
        nullable: true,
    })
    penaltyS: number;


    @Column("int", {
        nullable: true,
    })
    score: number;



    @ManyToOne(type => Person, person => person.personResults)
    person: Person;



    @ManyToOne(type => Race, race => race.personResults)
    race: Race;



    @OneToMany(type => SplitTime, splitTimes => splitTimes.personResult)
    splitTimes: SplitTime[];

}
