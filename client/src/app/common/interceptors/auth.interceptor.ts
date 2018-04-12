import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
    } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../auth.service';
import { LOGGING } from '../../util/logging';

const LOGGER = LOGGING.getLogger('auth-token-interceptor');

/**
 * Adds the authentication token to all API calls.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private injector: Injector) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.startsWith('/api')) {
            const authService = this.injector.get(AuthService);
            if (authService.token) {
                LOGGER.debug(`Adding request token...`);
                req = req.clone({ headers: req.headers.set('authorization', `Bearer: ${authService.token}`) });
            }
        }
        return next.handle(req);
    }
}
