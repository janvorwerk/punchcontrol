import { Component, OnInit, Input } from '@angular/core';
import { RacesService } from '../../data/races.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
    selectedRaceId: number;
    top = [
        {link: '/register', icon: 'register', title: 'Register a runner'},
        {link: ['/runners', {race: this.selectedRaceId}], icon: 'runner', title: 'Runners'},
        {link: ['/teams', {race: this.selectedRaceId}], icon: 'team', title: 'Teams'},
        {link: ['/race', {race: this.selectedRaceId}], icon: 'race', title: 'Race setup'},
        {link: ['/starttime', {race: this.selectedRaceId}], icon: 'time', title: 'Start times'},
        {link: ['/listings', {race: this.selectedRaceId}], icon: 'listing', title: 'Listings'},
        {link: ['/statistics', {race: this.selectedRaceId}], icon: 'statistics', title: 'Statistics'},
        {link: '/admin', icon: 'admin', title: 'Admin'},
    ];
    constructor(private racesService: RacesService) { }
    ngOnInit() {
        this.racesService.races.subscribe(state => this.selectedRaceId = state.selectedRaceId);
    }
}
