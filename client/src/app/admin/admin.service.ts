import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiError } from '@punchcontrol/shared/api';
import { AppSettings } from '@punchcontrol/shared/app-settings';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { LOGGING } from '../util/logging';
import { NotificationService } from '../common/components/notification/notification.service';

const LOGGER = LOGGING.getLogger('AdminService');


@Injectable()
export class AdminService {

    settings: Observable<AppSettings>;


    constructor(private http: HttpClient, private notificationService: NotificationService) {
        this.settings = this.http.get<AppSettings>('/api/admin/settings').pipe(
            shareReplay(1)
        );
    }

    openDatabase(): void {
        this.http.post('/api/admin/database', {}).subscribe((r) => {
            LOGGER.infoc(() => `Database opened`);
        }, (err) => {
            this.notificationService.notify({
                level: 'error',
                short: `Could not open database`,
                detail: err.error ? err.error.message : `Could not open database`
            }, {durationMs: 5000});
            LOGGER.error(`Could not open database ${err}`);
        });
    }
}
