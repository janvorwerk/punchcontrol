import { Component, OnInit, Input, ElementRef, AfterViewInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import { LOGGING } from '../../../util/logging';
import { Router } from '@angular/router';

const LOGGER = LOGGING.getLogger('IconComponent');

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
    fill: Observable<string>;
    constructor(themeService: ThemeService, private element: ElementRef, private router: Router) {
        this.fill = themeService.theme.delay(100).map(() => window.getComputedStyle(element.nativeElement.querySelector('svg')).color);
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
