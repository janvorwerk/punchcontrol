import { Injectable } from '@angular/core';

@Injectable()
export class BasepathService {
    readonly basepath: string;

    constructor() {
        this.basepath = this.buildBasePath();
    }

    /**
     * Builds the WebSocket URL for a given path
     *
     * @param endpoint the relative WebSocket endpoint
     * @returns the full URL
     */
    buildWebSocketUrl(endpoint: string): string {
        const scheme = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
        return `${scheme}//${window.location.host}${this.basepath}${endpoint}`;
    }

    private buildBasePath(): string {
        let path = '/';
        const base = document.querySelector('head > base');
        if (base && base['href']) {
            // base href return a full URL, not the content of the HTML
            path = base['href'].replace(window.location.origin, '');
            if (path.endsWith('/')) {
                path = path.slice(0, -1);
            }
        }
        return path;
    }
}
