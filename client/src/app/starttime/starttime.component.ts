import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../races.service';

@Component({
    selector: 'app-starttime',
    templateUrl: './starttime.component.html',
    styleUrls: ['./starttime.component.scss']
})
export class StarttimeComponent implements OnInit {

    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.map( r => r.selectedRaceId);
    }
    ngOnInit() {
    }
}
