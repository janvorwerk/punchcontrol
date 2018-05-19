import { Component, OnInit, Input } from '@angular/core';
import { RacesService } from '../../common/services/races.service';
import { TableService } from '../../common/components/table/table.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'app-race-courses',
    templateUrl: './race-courses.component.html',
    styleUrls: ['./race-courses.component.scss'],
    providers: [TableService]
})
export class RaceCoursesComponent implements OnInit {

    @Input()
    raceId: number;
    private subs = new Array<Subscription>();

    constructor(public t: TableService, private raceService: RacesService) {
    }
    
    ngOnInit() {
        this.t.register(`/api/generic/races/${this.raceId}/courses`);
    }


    uploadCourses(files: File[]) {
        this.raceService.uploadCourses(this.raceId, files);
    }
}
