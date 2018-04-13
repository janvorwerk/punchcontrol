import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { PersonResult } from './person_result';


@Entity()
export class SplitTime {

    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;


    @Column("int", {
        nullable: false,
    })
    seqNum: number;


    @Column("int", {
        nullable: false,
    })
    controlCode: number;


    @Column("integer", {
        nullable: false,
    })
    punchTimestamp: Date;


    @Column("text", {
        nullable: true,
    })
    status: string;



    @ManyToOne(type => PersonResult, personResult => personResult.splitTimes, { onDelete: 'CASCADE' })
    personResult: PersonResult;
}
