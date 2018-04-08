import { Component, OnInit, OnDestroy } from '@angular/core';
import { RacesService } from '../../races.service';
import { Subscription } from 'rxjs/Subscription';
import { RaceDto } from '@punchcontrol/shared/race-dto';
import { LOGGING } from '../../util/logging';

const LOGGER = LOGGING.getLogger('TableComponent');


@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, OnDestroy {
    tabsEnabled: boolean;
    races: RaceDto[] = [];

    private sub: Subscription[] = [];
    private selectedTab = -1;

    constructor(private racesService: RacesService) {
    }

    ngOnInit() {
        this.sub.push(this.racesService.races.subscribe(r => {
            this.selectedTab = r.selectedRaceId;
            this.races = r.races;
            this.tabsEnabled = r.enabled;
            LOGGER.debug(() => `Tabs are enabled=${r.enabled}`);
        }));
    }
    ngOnDestroy(): void {
        this.sub.forEach(s => s.unsubscribe());
    }
    // isSelected(id: number) {
    //     return this.selectedTab === id;
    // }
    getTabState(id: number) {
        return this.selectedTab === id ? 'selected' : 'enabled';
    }
}
