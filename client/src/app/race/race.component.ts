import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../data/races.service';

@Component({
    selector: 'app-race',
    templateUrl: './race.component.html',
    styleUrls: ['./race.component.scss']
})
export class RaceComponent implements OnInit {

    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.map(r => r.selectedRaceId);
    }
    ngOnInit() {
    }

}
