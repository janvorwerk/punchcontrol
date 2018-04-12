import { Injectable } from '@angular/core';
import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { LOGGING } from './util/logging';
import { BasepathService } from './common/services/basepath.service';
import { AuthService } from './auth.service';



const LOGGER = LOGGING.getLogger('websocket.service');


const BACKOFF_PERIODS_SEC = [.8, 1, 1, 2, 2, 2, 2, 5, 5, 5, 5, 15, 15, 15, 30];
// for future use if we had to talk to servers with a different protocol: list in order of preference
const SUPPORTED_VERSIONS = ['v1'];
export enum WebSocketState { CLOSED = 0, OPEN = 1 }

export interface WebSocketStateMessage {
    state: WebSocketState;
    wstoken?: string;
    closingCode?: number;
}

const KEEP_ALIVE_PERIOD_MS = 30 * 1000;

@Injectable()
export class WebSocketService {
    private readonly wsUrl: string;
    private ws: WebSocket | null = null;
    private backoffIndex = -1;
    private readonly receiveChannel = new Subject<WebSocketMessage>();
    private readonly stateChannel = new Subject<WebSocketStateMessage>();

    /**
     * An Observable to check the web socket state
     */
    readonly receive: Observable<WebSocketMessage> = this.receiveChannel.asObservable();


    /**
     * An Observable to check the web socket state
     */
    readonly state: Observable<WebSocketStateMessage> = this.stateChannel.asObservable();

    constructor(basepathService: BasepathService, authService: AuthService) {
        this.wsUrl = basepathService.buildWebSocketUrl('/ws');
        this.openWebSocket(authService.token);
        Observable.merge(
            Observable.interval(KEEP_ALIVE_PERIOD_MS),
            this.state.filter(s => s.state === WebSocketState.OPEN)
        ).subscribe(() => {
            this.send({ path: '/protocol/keepalive', body: '' });
        });

    }

    send(msg: WebSocketMessage): boolean {
        const str = JSON.stringify(msg);
        if (!this.ws) {
            LOGGER.warnc(() => `Could not send message on websocket: ${str} (no web socket)`);
            return false;
        } else if (this.ws.readyState !== WebSocket.OPEN) {
            LOGGER.warnc(() => `Could not send message on websocket: ${str} (readyState=${this.ws.readyState})`);
            return false;
        } else {
            this.ws.send(str);
            return true;
        }
    }

    private retryOpenWebSocket(): void {
        if (this.backoffIndex < BACKOFF_PERIODS_SEC.length - 1) {
            this.backoffIndex += 1;
        }
        const delay = BACKOFF_PERIODS_SEC[this.backoffIndex];
        LOGGER.infoc(() => `WebSocket connection lost, retrying in ${delay} seconds...`);
        setTimeout(() => this.openWebSocket(sessionStorage.getItem('skipper_user')), delay * 1000);
    }
    private openWebSocket(authToken: string): void {
        if (this.ws === null) {
            LOGGER.debug(() => `Trying to open WebSocket on ${this.wsUrl}`);
            this.ws = new WebSocket(this.wsUrl, SUPPORTED_VERSIONS);
            this.ws.onopen = () => {
                LOGGER.debug(`WebSocket opened, sending authentication`);
                this.ws.send(JSON.stringify({ path: '/protocol/authorization', body: 'Bearer ' + authToken }));
                this.backoffIndex = -1;
            };
            this.ws.onerror = (evt) => {
                LOGGER.infoc(() => `ERROR ========== ws closing ${evt}`);
            };
            this.ws.onmessage = (evt) => {
                const defaultMessage: WebSocketMessage = { path: '/protocol/error', body: 'Wrong message received' };
                const msg: WebSocketMessage = Object.assign(defaultMessage, JSON.parse(evt.data));
                let m;
                if (m = msg.path.match(/^\/protocol(\/[^/]*)*/)) {
                    if (m[1] === '/authorization') {
                        const cid: string = msg.body;
                        this.onEstablish(cid);
                    }
                } else {
                    this.receiveChannel.next(msg);
                }
            };
            this.ws.onclose = (closeEvent: CloseEvent) => this.onClose(closeEvent);
        }
    }

    private onEstablish(cid: string): void {
        this.stateChannel.next({ state: WebSocketState.OPEN, wstoken: cid });
        LOGGER.infoc(() => `WebSocket connection established (cid=${cid}, protocol=${this.ws.protocol})`);
    }

    private onClose(closeEvent: CloseEvent): void {
        LOGGER.infoc(() => `ws closing ${closeEvent.code}: ${closeEvent.reason}`);
        this.ws = null;
        this.stateChannel.next({ state: WebSocketState.CLOSED, closingCode: closeEvent.code });
        if (closeEvent.code !== 4401) {
            this.retryOpenWebSocket();
        }
    }
}
