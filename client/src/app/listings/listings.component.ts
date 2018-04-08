import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../data/races.service';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger('ListingsComponent');

@Component({
    selector: 'app-listings',
    templateUrl: './listings.component.html',
    styleUrls: ['./listings.component.scss']
})
export class ListingsComponent implements OnInit {
    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.map(r => r.selectedRaceId);
    }

    ngOnInit() {
    }
}
