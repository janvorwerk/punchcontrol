import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RacesService } from '../common/services/races.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-race',
    templateUrl: './race.component.html',
    styleUrls: ['./race.component.scss']
})
export class RaceComponent implements OnInit {

    raceId: number;
    private subs: Subscription[] = [];

    constructor(private raceService: RacesService) {
        this.subs.push(this.raceService.races.map(r => r.selectedRaceId).subscribe(id => this.raceId = id));
    }
    ngOnInit() {
    }

    uploadRegistration(files: File[]) {
        this.raceService.upload(this.raceId, files);
    }
}
