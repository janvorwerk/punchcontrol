import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AppComponent } from './app.component';
import { Err404Component } from './err404/err404.component';
import { IconComponent } from './lib/icon/icon.component';
import { LoremComponent } from './lib/lorem/lorem.component';
import { NavComponent } from './lib/nav/nav.component';
import { ListingsComponent } from './listings/listings.component';
import { RaceComponent } from './race/race.component';
import { RegisterComponent } from './register/register.component';
import { RunnersComponent } from './runners/runners.component';
import { SampleService } from './sample.service';
import { StarttimeComponent } from './starttime/starttime.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TeamsComponent } from './teams/teams.component';
import { WebSocketService } from './websocket.service';
import { WelcomeComponent } from './welcome/welcome.component';
import { TableComponent } from './lib/table/table.component';
import { ScrollComponent } from './lib/scroll/scroll.component';
import { FileSelectComponent } from './lib/file-select/file-select.component';
import { TabsComponent } from './lib/tabs/tabs.component';
import { SearchComponent } from './search/search.component';
import { CurrentUserComponent } from './lib/current-user/current-user.component';
import { HelpComponent } from './lib/help/help.component';
import { RacesService } from './data/races.service';

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
        AppComponent,
        RunnersComponent,
        Err404Component,
        IconComponent,
        RegisterComponent,
        TeamsComponent,
        RaceComponent,
        StarttimeComponent,
        ListingsComponent,
        StatisticsComponent,
        AdminComponent,
        NavComponent,
        LoremComponent,
        WelcomeComponent,
        TableComponent,
        ScrollComponent,
        FileSelectComponent,
        TabsComponent,
        SearchComponent,
        CurrentUserComponent,
        HelpComponent,
    ],
    imports: [
        RouterModule.forRoot(
            appRoutes
            // { enableTracing: true } // <-- debugging purposes only
        ),
        BrowserModule,
        HttpClientModule
    ],
    providers: [SampleService, WebSocketService, RacesService],
    bootstrap: [AppComponent]
})
export class AppModule { }
