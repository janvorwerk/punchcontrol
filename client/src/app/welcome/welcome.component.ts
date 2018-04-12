import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../admin/admin.service';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../common/services/auth.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {

    recentDatabases: string[];
    recentMasters: string[];
    private subs: Subscription[] = [];
    constructor(private adminService: AdminService, private authService: AuthService) {
    }

    ngOnInit() {
        this.subs.push(this.adminService.settings.subscribe(settings => {
            this.recentDatabases = settings.recentDatabases;
            this.recentMasters = settings.recentMasters;
        }));
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    get isLocal(): boolean {
        return this.authService.isLocal;
    }
}
