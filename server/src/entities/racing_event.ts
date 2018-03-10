import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Race } from './race';


@Entity()
export class RacingEvent {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column("text", {
        nullable: true,
    })
    name: string;


    @Column("text", {
        nullable: true,
    })
    website: string;

    @OneToMany(type => Race, race => race.racingEvent)
    races: Race[];
}
