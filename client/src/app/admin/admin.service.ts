import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiError } from '@punchcontrol/shared/api';
import { AppSettings } from '@punchcontrol/shared/app-settings';
import 'rxjs/add/operator/shareReplay';
import { Observable } from 'rxjs/Observable';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger('AdminService');


@Injectable()
export class AdminService {

    settings: Observable<AppSettings>;

    openDatabaseError: string | null = null;

    constructor(private http: HttpClient) {
        this.settings = this.http.get<AppSettings>('/api/admin/settings').shareReplay(1);
     }

    openDatabase(): void {
        this.openDatabaseError = null;
        this.http.post('/api/admin/database', {}).subscribe((r) => {
            LOGGER.infoc(() => `Database opened`);
        }, (err) => {
            this.openDatabaseError = err.error ? err.error.message : `Could not open database`;
            LOGGER.error(`Could not open database ${err}`);
        });
    }
}
