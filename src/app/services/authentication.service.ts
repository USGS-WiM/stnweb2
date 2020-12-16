import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Rx';
// import 'rxjs/add/operator/map';
// import 'rxjs/observable/of';
import { catchError, tap } from 'rxjs/operators';
import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from 'app/app.utilities';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '@interfaces/member';

import { CurrentUserService } from '@services/current-user.service';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user;
    constructor(
        private httpClient: HttpClient,
        private currentUserService: CurrentUserService
    ) {}
    /* istanbul ignore next */
    login(username: string, password: string) {
        /* istanbul ignore next */
        return this.httpClient
            .get(APP_SETTINGS.AUTH_URL + '.json', {
                headers: new HttpHeaders({
                    Authorization: 'Basic ' + btoa(username + ':' + password),
                }),
            })
            .pipe(
                tap((response: Member) => {
                    this.user = response;
                    localStorage.setItem('username', username);
                    localStorage.setItem('password', password);
                    localStorage.setItem(
                        'currentUser',
                        JSON.stringify(response)
                    );
                    this.currentUserService.updateCurrentUser(response);
                    return response;
                }),
                catchError(APP_UTILITIES.handleError<any>('login', []))
            );
    }

    logout() {
        // remove user from local storage to log user out
        // this.user = undefined;
        this.currentUserService.updateCurrentUser({ username: '' });
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('currentUser');

        return of(true);
    }
}
