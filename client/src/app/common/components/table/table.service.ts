import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PATCH_EL_RE, PatchDto } from '@punchcontrol/shared/patching';
import { TableData } from '@punchcontrol/shared/table-data';
import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';
import { LOGGING } from '../../../util/logging';
import { WebSocketService } from '../../services/websocket.service';
import { CellValueChangeEvent } from './table.component';
import { share } from 'rxjs/operators';

const LOGGER = LOGGING.getLogger('TableService');

@Injectable()
export class TableService {
    data: TableData | null = null;

    private dataSubject = new ReplaySubject<TableData>(1);
    // private tableSub: Subscription | null = null;
    private subs = new Array<Subscription>();

    constructor(private websocketService: WebSocketService, private http: HttpClient) {
        this.dataSubject.subscribe(t => this.data = t);
        // this.subs.push(this.tableSub);
    }

    register(url: string, wsMessagePath?: string) {
        // if (this.tableSub !== null) {
        //     this.tableSub.unsubscribe();
        //     this.subs = this.subs.filter(s => s !== this.tableSub);
        // }
        this.http.get<TableData>(url).subscribe(data => this.dataSubject.next(data));

        this.websocketService.receive.subscribe((msg: WebSocketMessage) => {
            if (msg.path === '/api/generic/patch') {
                LOGGER.infoc(() => `Receiving websocket ${msg.path}`);
                const patches: PatchDto[] = msg.body;
                for (const p of patches) {
                    const found = p.patchEl.match(PATCH_EL_RE.re);
                    if (found) {
                        const idColumn = this.data.columns.findIndex(c => c.id === PATCH_EL_RE.getField(found, 'id'));
                        const valueColumn = this.data.columns.findIndex(c => c.patchEl === p.patchEl);
                        this.data.rows.forEach((line: any[], index: number) => {
                            if (line[idColumn] === p.id && line[valueColumn] !== p.newVal) {
                                LOGGER.infoc(() => `Receiving websocket ${msg.path}: found matching line: ${JSON.stringify(line)}`);
                                line[valueColumn] = p.newVal;
                            }
                        });
                    }
                }
            } else if (msg.path === wsMessagePath) {
                this.http.get<TableData>(url).subscribe(data => this.dataSubject.next(data));
            }
        });


        return this.dataSubject.asObservable();
    }


    onEdit(event: CellValueChangeEvent) {
        LOGGER.debug(() => `Edited ${event.row}-${event.col}: ${event.oldValue} => ${event.newValue}`);
        // Store the change in our model so that it reflects the UI (otherwise restore would not work anyway)
        this.data.rows[event.row][event.col] = event.newValue;

        const patchEl: string = this.data.columns[event.col].patchEl;
        const found = patchEl.match(PATCH_EL_RE.re);
        if (!found) {
            LOGGER.errorc(() => `Could not match patch EL '${patchEl}' - ignoring...`);
        } else {
            const idColumn = this.data.columns.findIndex(c => c.id === PATCH_EL_RE.getField(found, 'id'));
            if (idColumn === -1) {
                LOGGER.error(`Could not find ID column - ignoring...`);
            } else {
                const idCell = this.data.rows[event.row][idColumn];
                const id = typeof (idCell) === 'number' ? idCell : parseInt(idCell, 10);
                const patch = { id, patchEl, oldVal: event.oldValue, newVal: event.newValue };
                const patches = [patch];
                this.patch(patches).subscribe(
                    (resp) => { LOGGER.info(`Patched OK for ${patches.length} changes`); },
                    (error: HttpErrorResponse) => {
                        LOGGER.error(`Patched KO for ${patches.length} changes: ${error.message}`);
                        this.restore(event);
                    }
                );
            }
        }
    }

    private restore(event: CellValueChangeEvent): void {
        this.data.rows[event.row][event.col] = event.oldValue;
    }

    private patch(patches: PatchDto[]): Observable<any> {
        return this.http.patch('/api/generic/patch', patches);
    }
}
