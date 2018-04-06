import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { ThemeService } from '../theme.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {

    fill: Observable<string>;
    constructor(themeService: ThemeService, private element: ElementRef) {
        this.fill = themeService.theme.delay(100).map(() => window.getComputedStyle(element.nativeElement).color);
    }

    @Input()
    title = '';

    @Input()
    icon = '';

    ngOnInit() {
    }
}
