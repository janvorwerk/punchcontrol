import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppSettings } from '@punchcontrol/shared/app-settings';
import { RaceDto } from '@punchcontrol/shared/race-dto';
import { Subscription } from 'rxjs/Subscription';
import { map } from 'rxjs/operators';
import { RacesService } from '../common/services/races.service';
import { Theme, ThemeService } from '../common/services/theme.service';
import { AdminService } from './admin.service';
import { TableService } from '../common/components/table/table.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    providers: [TableService]
})
export class AdminComponent implements OnInit, OnDestroy {
    settings: AppSettings;
    selectedTheme: Theme;
    allThemes: Theme[];
    allRaces: RaceDto[];

    private subs: Subscription[] = [];
    constructor(private themeService: ThemeService,
        private racesService: RacesService,
        public adminService: AdminService,
        public t: TableService) {

        this.subs.push(themeService.theme.subscribe(theme => this.selectedTheme = theme));
        this.allThemes = themeService.themes;
        this.subs.push(racesService.races.pipe(map(r => r.races)).subscribe(races => this.allRaces = races));
        this.subs.push(adminService.settings.subscribe(settings => this.settings = settings));
        this.t.register(`/api/generic/races`);
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
        this.adminService.openDatabase(this.settings.recentDatabases[0]);
    }
    addRace() {
        this.racesService.createRace();
    }
}
