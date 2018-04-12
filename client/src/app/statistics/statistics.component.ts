import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../common/services/races.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.map( r => r.selectedRaceId);
    }
    ngOnInit() {
    }
}
