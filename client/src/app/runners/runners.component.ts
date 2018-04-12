import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../common/services/races.service';
import { LOGGING } from '../util/logging';
import { Subscription } from 'rxjs/Subscription';

const LOGGER = LOGGING.getLogger('RunnersComponent');


@Component({
    selector: 'app-runners',
    templateUrl: './runners.component.html',
    styleUrls: ['./runners.component.css']
})
export class RunnersComponent implements OnInit {

    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.map( r => r.selectedRaceId);
    }
    ngOnInit() {
    }
}
