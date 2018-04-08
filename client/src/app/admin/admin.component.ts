import { Component, OnDestroy, OnInit } from '@angular/core';
import { LOGGING } from '../util/logging';
import { ThemeService, Theme } from '../lib/theme.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { RacesService } from '../races.service';
import { RaceDto } from '@punchcontrol/shared/race-dto';
import { AdminService } from './admin.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
    selectedTheme: Theme;
    allThemes: Theme[];
    allRaces: RaceDto[];

    private subs: Subscription[] = [];
    constructor(private themeService: ThemeService, private racesService: RacesService, public adminService: AdminService) {
        this.subs.push(themeService.theme.subscribe(theme => this.selectedTheme = theme));
        this.allThemes = themeService.themes;
        this.subs.push(racesService.races.map(r => r.races).subscribe(races => this.allRaces = races));
    }
    ngOnInit() {
    }
    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }
    onThemeChange() {
        this.themeService.setTheme(this.selectedTheme);
    }
    openDatabase() {
        this.adminService.openDatabase();
    }
}
