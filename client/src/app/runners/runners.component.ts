import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { RacesService } from '../common/services/races.service';
import { LOGGING } from '../util/logging';
import { Subscription } from 'rxjs/Subscription';
import { TableService } from '../common/components/table/table.service';

const LOGGER = LOGGING.getLogger('RunnersComponent');


@Component({
    selector: 'app-runners',
    templateUrl: './runners.component.html',
    styleUrls: ['./runners.component.css'],
    providers: [TableService]

})
export class RunnersComponent implements OnInit, OnDestroy {

    raceId: Observable<number>;
    private subs = new Array<Subscription>();

    constructor(public t: TableService,
        private raceService: RacesService) {
        this.raceId = this.raceService.races.pipe(
            map( r => r.selectedRaceId)
        );

        this.subs.push(this.raceId.subscribe(id => this.t.register(`/api/generic/races/${id}/runners`)));

    }
    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

}
