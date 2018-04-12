import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

type NotifState = 'prepared' | 'visible' | 'expanded' | 'hidden';
export type NotifLevel = 'info' | 'warning' | 'error';

interface NotifMessage {
    level: NotifLevel;
    short: string;
    detail: string;
}
export class PunchNotification {
    private _state: NotifState;
    constructor(
        readonly msg: NotifMessage,
        readonly durationMs?: number
    ) {
        this._state = 'prepared';
    }
    get state() { return this._state; }
    show() {
        this._state = 'visible';
    }
    expand() {
        this._state = 'expanded';
    }
    hide() {
        this._state = 'hidden';
    }
}


@Injectable()
export class NotificationService {
    notifications = new BehaviorSubject<PunchNotification[]>([]);
    expanded = new BehaviorSubject<PunchNotification[]>([]);
    constructor() { }
    notify(msg: NotifMessage, options: { durationMs?: number } = {}) {
        const current = this.notifications.getValue();
        const isNew = (0 === current.filter(n =>
            n.msg.level === msg.level &&
            n.msg.short === msg.short &&
            n.msg.detail === msg.detail
        ).length);
        if (isNew) {
            const notif = new PunchNotification(msg, options.durationMs);
            setTimeout(() => this.show(notif), 50); // leave some time for the animation
            const next = [...current];
            next.push(notif);
            this.notifications.next(next);
        }
    }
    show(notif: PunchNotification): void {
        notif.show();
        if (notif.durationMs) {
            setTimeout(() => {
                if (notif.state === 'visible') {
                    notif.hide();
                    setTimeout(() => {
                        this.close(notif);
                    }, 50);
                }
            }, notif.durationMs);
        }

    }
    close(notif: PunchNotification): void {
        const msg = notif.msg;
        const current = this.notifications.getValue();
        const next = current.filter(n =>
            n.msg.level !== msg.level ||
            n.msg.short !== msg.short ||
            n.msg.detail !== msg.detail
        );
        this.notifications.next(next);
    }
    expand(notif: PunchNotification): void {
        this.close(notif);
        notif.expand();
        this.expanded.next([notif]); // only allow one for now
    }
    closeExpanded(): void {
        this.expanded.next([]);
    }
}
