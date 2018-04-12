import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin/admin.component';
import { AppComponent } from './app.component';
import { Err404Component } from './err404/err404.component';
import { IconComponent } from './common/components/icon/icon.component';
import { LoremComponent } from './common/components/lorem/lorem.component';
import { NavComponent } from './nav/nav.component';
import { ListingsComponent } from './listings/listings.component';
import { RaceComponent } from './race/race.component';
import { RegisterComponent } from './register/register.component';
import { RunnersComponent } from './runners/runners.component';
import { TeamsService } from './teams/teams.service';
import { StarttimeComponent } from './starttime/starttime.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TeamsComponent } from './teams/teams.component';
import { WebSocketService } from './common/services/websocket.service';
import { WelcomeComponent } from './welcome/welcome.component';
import { TableComponent } from './common/components/table/table.component';
import { ScrollComponent } from './common/components/scroll/scroll.component';
import { FileSelectComponent } from './common/components/file-select/file-select.component';
import { TabsComponent } from './tabs/tabs.component';
import { SearchComponent } from './search/search.component';
import { CurrentUserComponent } from './common/components/current-user/current-user.component';
import { HelpComponent } from './common/components/help/help.component';
import { RacesService } from './common/services/races.service';
import { ThemeService } from './common/services/theme.service';
import { AdminService } from './admin/admin.service';
import { AuthService } from './common/services/auth.service';
import { BasepathService } from './common/services/basepath.service';
import { AuthInterceptor } from './common/interceptors/auth.interceptor';
import { BasepathInterceptor } from './common/interceptors/basepath.interceptor';

const appRoutes: Routes = [
    { path: 'register', component: RegisterComponent },
    { path: 'runners', component: RunnersComponent },
    { path: 'teams', component: TeamsComponent },
    { path: 'race', component: RaceComponent },
    { path: 'starttime', component: StarttimeComponent },
    { path: 'listings', component: ListingsComponent },
    { path: 'statistics', component: StatisticsComponent },
    { path: 'admin', component: AdminComponent },
    { path: 'welcome', component: WelcomeComponent },

    { path: '', pathMatch: 'full', redirectTo: 'welcome' },
    { path: '**', component: Err404Component }
];


@NgModule({
    declarations: [
        AdminComponent,
        AppComponent,
        CurrentUserComponent,
        Err404Component,
        FileSelectComponent,
        HelpComponent,
        IconComponent,
        ListingsComponent,
        LoremComponent,
        NavComponent,
        RaceComponent,
        RegisterComponent,
        RunnersComponent,
        ScrollComponent,
        SearchComponent,
        StarttimeComponent,
        StatisticsComponent,
        TableComponent,
        TabsComponent,
        TeamsComponent,
        WelcomeComponent,
    ],
    imports: [
        RouterModule.forRoot(
            appRoutes
            // { enableTracing: true } // <-- debugging purposes only
        ),
        BrowserModule,
        FormsModule,
        HttpClientModule
    ],
    providers: [
        AdminService,
        AuthService,
        BasepathService,
        RacesService,
        TeamsService,
        ThemeService,
        WebSocketService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        // Run the basepath LAST as it changes the URL
        // so the AuthInterceptor which checks if the
        // URL starts with /api would be screwed up.
        {
            provide: HTTP_INTERCEPTORS,
            useClass: BasepathInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
