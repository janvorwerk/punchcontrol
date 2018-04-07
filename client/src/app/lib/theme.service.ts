import { Injectable } from '@angular/core';
import { LOGGING } from '../util/logging';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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

    private _currentTheme = new BehaviorSubject<Theme>(this.themes[0]);
    theme = this._currentTheme.asObservable();

    constructor() { }

    setTheme(theme: Theme) {
        this._currentTheme.next(theme);
        LOGGER.info(`Switching theme to ${theme}`);
        const themeSelector = document.querySelector('head > link.theme-selector-link');
        (themeSelector as any).href = `assets/gen/theme-${theme}.css`;
    }
}
