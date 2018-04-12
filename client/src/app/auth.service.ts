import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
    readonly user: string;
    readonly token: string;
    constructor() {
        this.user = sessionStorage.getItem('user') || 'anonymous';
        this.token = sessionStorage.getItem('auth');
    }
    get isLocal(): boolean {
        return this.user === '__local__';
    }
}
