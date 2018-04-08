import { Component, OnInit, Input } from '@angular/core';
import { RacesService } from '../../data/races.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
    _selectedRaceId: number;
    targets = [
        // the targets with an array are actually expecting the raceId, but we cannot
        // set it here because it would not be dynamic. This is the role of getTargetLink(index).
        {link: '/register', icon: 'register', title: 'Register a runner'},
        {link: ['/runners'], icon: 'runner', title: 'Runners'},
        {link: ['/teams'], icon: 'team', title: 'Teams'},
        {link: ['/race'], icon: 'race', title: 'Race setup'},
        {link: ['/starttime'], icon: 'time', title: 'Start times'},
        {link: ['/listings'], icon: 'listing', title: 'Listings'},
        {link: ['/statistics'], icon: 'statistics', title: 'Statistics'},
        {link: '/admin', icon: 'admin', title: 'Admin'},
    ];
    constructor(private racesService: RacesService) { }
    ngOnInit() {
        this.racesService.races.subscribe(state => this._selectedRaceId = state.selectedRaceId);
    }
    get selectedRaceId(): number {
        return this._selectedRaceId;
    }
    getTargetLink(index: number) {
        const link = this.targets[index].link;
        if (typeof(link) === 'string') {
            return link;
        } else {
            return [link[0], {race: this.selectedRaceId}];
        }
    }
}
