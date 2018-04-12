import { Injectable } from '@angular/core';
import { TableComponent } from '../table/table.component';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export interface StickyScrollable {
    offsetTop: number;
    offsetBottom: number;
    sticky: boolean;
}


@Injectable()
export class ScrollService {
    components = new Array<StickyScrollable>();
    stickyEvents = new Array<Subject<[boolean, number]>>();
    constructor() { }
    register(component: StickyScrollable): Observable<[boolean, number]> {
        this.components.push(component);
        const subject = new Subject<[boolean, number]>();
        this.stickyEvents.push(subject);
        return subject.asObservable();
    }
    setSticky(index: number, sticky: boolean, top: number) {
        this.stickyEvents[index].next([sticky, top]);
    }
}
