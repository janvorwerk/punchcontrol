import { Injectable } from '@angular/core';
import { LOGGING } from '../util/logging';
import { HttpClient } from '@angular/common/http';
const LOGGER = LOGGING.getLogger('RegisterService');

@Injectable()
export class RegisterService {

    constructor(private http: HttpClient) { }

    upload(files: File[]): void {
        const raceId = 1;
        for (let i = 0; i < files.length; i++) {
            LOGGER.infoc(() => `File ${i}: '${files[i].name}' (${files[i].size} bytes)`);
            this.http.post(`/api/db/races/${raceId}/registration`, files[i]).subscribe((r) => {
                LOGGER.infoc(() => `File '${files[i].name}' uploaded`);
            }, (err) => {
                LOGGER.error(`Could not upload '${files[i].name}' ${err}`);
            });
        }
    }

    openDatabase(): void {
        this.http.post('/api/admin/database', {}).subscribe((r) => {
            LOGGER.infoc(() => `Database opened`);
        }, (err) => {
            LOGGER.error(`Could not open database ${err}`);
        });    }

}
