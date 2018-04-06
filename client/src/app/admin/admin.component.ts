import { Component, OnDestroy, OnInit } from '@angular/core';
import { LOGGING } from '../util/logging';
import { ThemeService, Theme } from '../lib/theme.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
    selectedTheme: Theme;
    allThemes: Theme[];

    private subs: Subscription[] = [];
    constructor(private themeService: ThemeService) {
        this.subs.push(themeService.theme.subscribe(theme => this.selectedTheme = theme));
        this.allThemes = themeService.themes;
    }
    ngOnInit() {
    }
    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }
    onThemeChange() {
        this.themeService.setTheme(this.selectedTheme);
    }

}
