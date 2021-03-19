import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Member } from '@interfaces/member';

@Injectable()
export class CurrentUserService {
    private userSubject = new BehaviorSubject(null);
    currentUser = this.userSubject.asObservable();

    private loggedInSubject = new BehaviorSubject(false);
    loggedIn = this.loggedInSubject.asObservable();

    constructor() {}

    updateCurrentUser(user) {
        this.userSubject.next(user);
    }

    updateLoggedInStatus(status) {
        this.loggedInSubject.next(status);
    }
}
