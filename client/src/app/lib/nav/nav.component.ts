import { Component, OnInit } from '@angular/core';
import { RacesService } from '../../data/races.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
    selectedRaceId: number;
    constructor(private racesService: RacesService) { }

    ngOnInit() {
        this.racesService.races.subscribe(state => this.selectedRaceId = state.selectedRaceId);
    }
}
