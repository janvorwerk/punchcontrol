import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiError } from '@punchcontrol/shared/api';
import { AppSettings } from '@punchcontrol/shared/app-settings';
import { Observable } from 'rxjs/Observable';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger('AdminService');


@Injectable()
export class AdminService {

    openDatabaseError: string | null = null;

    constructor(private http: HttpClient) { }

    openDatabase(): void {
        this.openDatabaseError = null;
        this.http.post('/api/admin/database', {}).subscribe((r) => {
            LOGGER.infoc(() => `Database opened`);
        }, (err) => {
            this.openDatabaseError = err.error ? err.error.message : `Could not open database`;
            LOGGER.error(`Could not open database ${err}`);
        });
    }

    readSettings(): Observable<AppSettings> {
        return this.http.get<AppSettings>('/api/admin/settings');
        // .subscribe((r) => {
        //     LOGGER.infoc(() => `Read settings OK: ${JSON.stringify(r)}`);
        // }, (err) => {
        //     LOGGER.error(`Could not read app settings ${err}`);
        // });
    }
}
