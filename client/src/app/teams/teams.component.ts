import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../common/services/races.service';

import { TeamsService } from '../teams/teams.service';
import { TableData } from '@punchcontrol/shared/table-data';
import { CellValueChangeEvent } from '../common/components/table/table.component';
import { LOGGING } from '../util/logging';
import { Subscription } from 'rxjs/Subscription';
import { PATCH_EL_RE, PatchDto } from '@punchcontrol/shared/patching';
import { HttpErrorResponse } from '@angular/common/http';
import { WebSocketService } from '../common/services/websocket.service';
import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';

const LOGGER = LOGGING.getLogger('ListingsComponent');

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit, OnDestroy {

    raceId: Observable<number>;

    data: TableData | null = null;

    private subs = new Array<Subscription>();
    constructor(private websocketService: WebSocketService,
        private teamsService: TeamsService,
        private raceService: RacesService) {

        this.raceId = this.raceService.races.map(r => r.selectedRaceId);
        this.subs.push(this.raceId.subscribe( r => {
            this.subs.push(this.teamsService.getTeamMembers(r).subscribe(data => this.data = data));
        }));
        this.websocketService.receive.subscribe((msg: WebSocketMessage) => {
            if (msg.path === '/data/update') {
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
            }
        });
    }

    ngOnInit() {
    }
    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
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
                this.teamsService.patch(patches).subscribe(
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
}
