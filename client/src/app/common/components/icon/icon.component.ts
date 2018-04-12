import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { delay, map } from 'rxjs/operators';
import { LOGGING } from '../../../util/logging';
import { ThemeService } from '../../services/theme.service';

const LOGGER = LOGGING.getLogger('IconComponent');

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
    fill: Observable<string>;
    constructor(themeService: ThemeService, private element: ElementRef, private router: Router) {
        this.fill = themeService.theme.pipe(
            delay(100),
            map(() => window.getComputedStyle(element.nativeElement.querySelector('svg')).color)
        );
    }

    @Input()
    icon = '';

    ngOnInit() {
    }

    state(route: string|[string, any]) {
        const path = route instanceof Array ? route[0] : route;
        const active = this.router.isActive(path, false);
        return active ? 'active' : '';
    }
}
