import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PersonDto } from '@punchcontrol/shared/person-dto';
import { Observable } from 'rxjs/Observable';
import { TeamMemberDto } from '@punchcontrol/shared/team-member-dto';
import { TableData } from '@punchcontrol/shared/table-data';
import { PatchDto } from '../../../shared/dist/patching';
import { LOGGING } from './util/logging';

const LOGGER = LOGGING.getLogger('sample.service');

@Injectable()
export class SampleService {
    private _data: Observable<PersonDto>;

    private _tmData: Observable<TableData>;

    constructor(private http: HttpClient) {
        this._data = this.http.get<PersonDto>('/api/whoami');
        this._tmData = this.http.get<TableData>('/api/tm');
    }

    get data(): Observable<PersonDto> {
        return this._data;
    }

    get teamMembers(): Observable<TableData> {
        return this._tmData;
    }

    patch(patches: PatchDto[]): Observable<any> {
        return this.http.patch('/api/patch', patches);
    }
}
