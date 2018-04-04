import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../data/races.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {

    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.map( r => r.selectedRaceId);
    }
    ngOnInit() {
    }
}
