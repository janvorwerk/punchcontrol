import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Organisation } from './organisation';
import { Race } from './race';
import { TeamClass } from './team_class';
import { TeamMember } from './team_member';


@Entity()
export class Team {
    @Column("int")
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Race, race => race.teams, { onDelete: 'RESTRICT' })
    race: Race;


    @Column("int", {
        nullable: true,
    })
    bib: number;


    @Column("text", {
        nullable: false,
    })
    name: string;


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


    @ManyToOne(type => TeamClass, teamClass => teamClass.teams, { onDelete: 'SET NULL' })
    teamClass: TeamClass;


    @ManyToOne(type => Organisation, organisation => organisation.teams, { onDelete: 'SET NULL' })
    organisation: Organisation;


    @OneToMany(type => TeamMember, teamMembers => teamMembers.team)
    teamMembers: TeamMember[];
}
