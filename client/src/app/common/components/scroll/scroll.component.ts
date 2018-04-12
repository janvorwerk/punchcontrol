import { Component, AfterViewInit, ElementRef, HostListener, NgZone, OnInit } from '@angular/core';
import { ScrollService } from './scroll.service';
import { Subject } from 'rxjs/Subject';
import { LOGGING } from '../../../util/logging';

const LOGGER = LOGGING.getLogger('ScrollComponent');

@Component({
    selector: 'app-scroll',
    templateUrl: './scroll.component.html',
    styleUrls: ['./scroll.component.scss'],
    providers: [ScrollService]
})
export class ScrollComponent implements OnInit {
    constructor(private element: ElementRef, private scrollService: ScrollService, private zone: NgZone) { }
    ngOnInit(): void {
        // run outside angular so that there is not a change-detection at every single scroll event
        this.zone.runOutsideAngular(() => {
            this.element.nativeElement.addEventListener('scroll', (event: Event) => {
                this.onScroll(event);
            });
        });
    }

    onScroll(event: Event): void {
        const top = this.element.nativeElement.offsetTop;
        const currentScroll = this.element.nativeElement.scrollTop + top;

        this.scrollService.components.forEach((component, index) => {
            const shouldBeSticky = currentScroll > component.offsetTop && currentScroll < component.offsetBottom;
            LOGGER.tracec((
            ) => `currentScroll: ${currentScroll} -- top: ${component.offsetTop} / bottom: ${component.offsetBottom}`);
            if (component.sticky !== shouldBeSticky) {
                LOGGER.infoc(() => `Sticky: ${shouldBeSticky} / top: ${top}`);
                // since we were called "out of Angular", make sure our listeners will be back into Angular
                this.zone.run(() => this.scrollService.setSticky(index, shouldBeSticky, top));
            }
        });
    }
}
