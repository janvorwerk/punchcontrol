import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LOGGING } from '../util/logging';
import { ApiError } from '@punchcontrol/shared/api';

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
}
