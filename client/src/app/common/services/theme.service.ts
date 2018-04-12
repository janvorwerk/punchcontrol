import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { LOGGING } from '../../util/logging';
const LOGGER = LOGGING.getLogger('ThemeService');

const THEMES = {
    'dark-brown': 0,
    'light-brown': 0,
    'dark-orange': 0,
};
export type Theme = keyof typeof THEMES;

@Injectable()
export class ThemeService {

    themes = Object.keys(THEMES) as Theme[];

    private _currentTheme: BehaviorSubject<Theme>;
    theme: Observable<Theme>;

    constructor() {
        let themeStr = localStorage.getItem('theme');
        const allowed = this.themes as string[];
        if (!allowed.includes(themeStr)) {
            themeStr = this.themes[0];
        }
        const theme = themeStr as Theme;
        this._currentTheme = new BehaviorSubject<Theme>(theme);
        this.updateHref(theme);
        this.theme = this._currentTheme.asObservable();
    }

    setTheme(theme: Theme) {
        this._currentTheme.next(theme);
        LOGGER.info(`Switching theme to ${theme}`);
        localStorage.setItem('theme', theme);
        this.updateHref(theme);
    }

    private updateHref(theme: Theme) {
        const themeSelector = document.querySelector('head > link.theme-selector-link');
        (themeSelector as any).href = `assets/gen/theme-${theme}.css`;
    }
}
