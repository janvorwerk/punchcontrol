import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PersonDto } from '@punchcontrol/shared/person-dto';
import { Observable } from 'rxjs/Observable';
import { TeamMemberDto } from '@punchcontrol/shared/team-member-dto';
import { TableData } from '@punchcontrol/shared/table-data';
import { PatchDto } from '../../../../shared/dist/patching';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger('sample.service');

@Injectable()
export class TeamsService {

    constructor(private http: HttpClient) {
    }

    getTeamMembers(raceId: number): Observable<TableData> {
        return this.http.get<TableData>('/api/db/teammembers'); // FIXME add race ID in URL
    }

    patch(patches: PatchDto[]): Observable<any> {
        return this.http.patch('/api/db/patch', patches);
    }
}
