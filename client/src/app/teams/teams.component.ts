import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PATCH_EL_RE, PatchDto } from '@punchcontrol/shared/patching';
import { TableData } from '@punchcontrol/shared/table-data';
import { WebSocketMessage } from '@punchcontrol/shared/websocket-dto';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { map } from 'rxjs/operators';
import { CellValueChangeEvent } from '../common/components/table/table.component';
import { RacesService } from '../common/services/races.service';
import { WebSocketService } from '../common/services/websocket.service';
import { LOGGING } from '../util/logging';
import { TableService } from '../common/components/table/table.service';


const LOGGER = LOGGING.getLogger('ListingsComponent');

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  providers: [TableService]
})
export class TeamsComponent implements OnInit, OnDestroy {

    raceId: Observable<number>;


    private subs = new Array<Subscription>();
    constructor(private websocketService: WebSocketService,
        public t: TableService,
        private raceService: RacesService) {

        this.raceId = this.raceService.races.pipe(map(r => r.selectedRaceId));
        this.subs.push(this.raceId.subscribe(id => this.t.register(`/api/races/${id}/teammembers`)));
    }

    ngOnInit() {
    }
    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }
}
