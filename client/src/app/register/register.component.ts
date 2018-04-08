import { Component, OnInit } from '@angular/core';
import { RegisterService } from './register.service';
import { LOGGING } from '../util/logging';

const LOGGER = LOGGING.getLogger('RegisterComponent');

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    providers: [RegisterService],
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

    constructor(private registerService: RegisterService) { }

    ngOnInit() {
    }
}
