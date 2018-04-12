import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { RacesService } from '../common/services/races.service';

@Component({
    selector: 'app-starttime',
    templateUrl: './starttime.component.html',
    styleUrls: ['./starttime.component.scss']
})
export class StarttimeComponent implements OnInit {

    raceId: Observable<number>;

    constructor(private raceService: RacesService) {
        this.raceId = this.raceService.races.pipe(map(r => r.selectedRaceId));
    }
    ngOnInit() {
    }
}
