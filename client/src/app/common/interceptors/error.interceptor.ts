import { HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators/catchError';
import { LOGGING } from '../../util/logging';
import { NotificationService } from '../components/notification/notification.service';
import { isApiError } from '@punchcontrol/shared/api';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

const LOGGER = LOGGING.getLogger('ErrorInterceptor');

/**
 * Handles errors and shows a systematic notification
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private notificationService: NotificationService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const obs = next.handle(req);
        return obs.pipe(catchError((err: HttpErrorResponse, caught) => {
            if (isApiError(err.error)) {
                this.notificationService.notify({ level: 'error', short: err.error.short, detail: err.error.detail });
            } else {
                this.notificationService.notify({ level: 'error', short: 'Unpecpected error', detail: JSON.stringify(err.error) });
            }
            return new ErrorObservable(err);
        }));
    }
}
