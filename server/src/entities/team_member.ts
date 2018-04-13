import { ActualCourse } from './actual_course';
import {
    Column,
    Entity,
    Index,
    ManyToOne
} from 'typeorm';
import { Person } from './person';
import { Team } from './team';
import { TeamMemberClass } from './team_member_class';


@Entity()
@Index("pk_team_member", ["bibSubnum", "team"], { unique: true })
export class TeamMember {
    @ManyToOne(type => Team, team => team.teamMembers, {
        primary: true,
        eager: true /* eager because primary */,
        nullable: false,
        onDelete: 'CASCADE'
    })
    team: Team;

    @Column("int", {
        nullable: false, primary: true
    })
    bibSubnum: number;



    @ManyToOne(type => Person, person => person.teamMembers, { onDelete: 'SET NULL' })
    person: Person;



    @ManyToOne(type => TeamMemberClass, memberClass => memberClass.teamMembers, { onDelete: 'RESTRICT' })
    memberClass: TeamMemberClass;



    @ManyToOne(type => ActualCourse, actualCourse => actualCourse.teamMembers, { onDelete: 'SET NULL' })
    actualCourse: ActualCourse;

}
