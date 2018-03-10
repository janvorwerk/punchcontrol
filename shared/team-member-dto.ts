import { PersonDto } from './person-dto';

export interface TeamDto {
    bib: number,
    name: string
}

export interface TeamMemberDto {

    bibSubnum: number,

    team: TeamDto,
    person: PersonDto
}
