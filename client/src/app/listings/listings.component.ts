import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { RacesService } from '../common/services/races.service';
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
        this.raceId = this.raceService.races.pipe(map(r => r.selectedRaceId));
    }

    ngOnInit() {
    }
}
