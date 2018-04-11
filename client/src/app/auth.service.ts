import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
    user: string;
    constructor() {
        this.user = sessionStorage.getItem('user') || 'anonymous';
    }
    get isLocal(): boolean {
        return this.user === '__local__';
    }
}
