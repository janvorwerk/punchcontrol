import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs/observable/interval';
import { take } from 'rxjs/operators';
import { NotificationService, NotifLevel, PunchNotification } from './notification.service';


@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
    notifications: PunchNotification[];
    expanded: PunchNotification[];
    status: Map<number, string> = new Map();
    constructor(private notificationService: NotificationService) {
        // FIXME: unsubscribe!
        notificationService.notifications.subscribe(notifs => this.notifications = notifs);
        notificationService.expanded.subscribe(notifs => this.expanded = notifs);
    }

    ngOnInit() {
        // interval(1000).pipe(take(5)).subscribe((n) => this.notificationService.notify({
        //     short: `Hello ${n}`,
        //     detail: `This is the error #${n}`,
        //     level: ['warning', 'error', 'info'][n % 3] as NotifLevel
        // }));
    }
    expand(notif: PunchNotification) {
        this.notificationService.expand(notif);
    }
    close(notif: PunchNotification) {
        this.notificationService.close(notif);
    }
    closeExpanded() {
        this.notificationService.closeExpanded();
    }
    cancel(event: Event) {
        event.cancelBubble = true;
    }
}
