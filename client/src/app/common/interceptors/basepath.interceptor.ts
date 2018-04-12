import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
    } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LOGGING } from '../../util/logging';
import { BasepathService } from '../services/basepath.service';


const LOGGER = LOGGING.getLogger('BasepathInterceptor');

/**
 * The interceptor handles the base path for all API calls
 */
@Injectable()
export class BasepathInterceptor implements HttpInterceptor {

    constructor(private basepathService: BasepathService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.startsWith('/api')) {
            const newUrl = `${this.basepathService.basepath}${req.url}`;
            LOGGER.debug(`Converting request: ${req.url} => ${newUrl}`);
            req = req.clone({ url: newUrl });
        }
        return next.handle(req);
    }
}
