import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Race } from './race';
import { Team } from './team';
import { TeamMemberClass } from './team_member_class';


@Entity()
export class TeamClass {
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


    @Column("decimal", {
        nullable: true,
    })
    fee: number;


    @Column("int", {
        nullable: true,
    })
    bibStart: number;



    @ManyToOne(type => Race, race => race.teamClasses)
    race: Race;

    @OneToMany(type => Team, teams => teams.teamClass)
    teams: Team[];

    @OneToMany(type => TeamMemberClass, teamMemberClasses => teamMemberClasses.teamClass)
    teamMemberClasses: TeamMemberClass[];
}
