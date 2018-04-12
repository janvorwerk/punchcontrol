import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { RacesService } from '../common/services/races.service';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger('RunnersComponent');


@Component({
    selector: 'app-runners',
    templateUrl: './runners.component.html',
    styleUrls: ['./runners.component.css']
})
export class RunnersComponent implements OnInit {

    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.pipe(
            map( r => r.selectedRaceId)
        );
    }
    ngOnInit() {
    }
}
