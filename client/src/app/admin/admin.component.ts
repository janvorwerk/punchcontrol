import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppSettings } from '@punchcontrol/shared/app-settings';
import { RaceDto } from '@punchcontrol/shared/race-dto';
import { Subscription } from 'rxjs/Subscription';
import { map } from 'rxjs/operators';
import { RacesService } from '../common/services/races.service';
import { Theme, ThemeService } from '../common/services/theme.service';
import { AdminService } from './admin.service';
import { TableService } from '../common/components/table/table.service';
import { TableRange } from '../common/components/table/table.component';

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
    private raceSelection: TableRange|null;

    private subs: Subscription[] = [];
    constructor(private themeService: ThemeService,
        private racesService: RacesService,
        public adminService: AdminService,
        public t: TableService) {

        this.subs.push(themeService.theme.subscribe(theme => this.selectedTheme = theme));
        this.allThemes = themeService.themes;
        this.subs.push(racesService.races.pipe(map(r => r.races)).subscribe(races => this.allRaces = races));
        this.subs.push(adminService.settings.subscribe(settings => this.settings = settings));
        this.t.register(`/api/generic/races`, '/api/races');
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
    onRaceSelection(selection: TableRange|null) {
        this.raceSelection = selection;
    }
    deleteRaces() {
        if (this.raceSelection) {
            const ids = [];
            const col = this.t.data.columns.findIndex(c => c.id === 'raceId');
            for (let r = this.raceSelection.startRow; r <= this.raceSelection.endRow; r++) {
                const row = this.t.data.rows[r];
                ids.push(row[col]);
            }
            this.racesService.deleteRaces(ids);
        }
    }
}
