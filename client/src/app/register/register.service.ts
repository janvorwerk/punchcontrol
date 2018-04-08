import { Injectable } from '@angular/core';
import { LOGGING } from '../util/logging';
import { HttpClient } from '@angular/common/http';
const LOGGER = LOGGING.getLogger('RegisterService');

@Injectable()
export class RegisterService {

    constructor(private http: HttpClient) { }
}
