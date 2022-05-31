import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Rx';
// import 'rxjs/add/operator/map';
// import 'rxjs/observable/of';
import { map } from 'rxjs/operators';
import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from 'app/app.utilities';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '@interfaces/member';

import { CurrentUserService } from '@services/current-user.service';
import { of } from 'rxjs';
import { Observable } from 'rx';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user;
    constructor(
        private httpClient: HttpClient,
        private currentUserService: CurrentUserService
    ) { }
    
    /* istanbul ignore next */
    login(username: string, password: string) {
        const HTTP_OPTIONS = {
            headers: new HttpHeaders({
                Authorization: 'Basic ' + btoa(username + ':' + password)
            })
        };

        const self = this;
        return this.httpClient.post(APP_SETTINGS.AUTH_URL + '.json', null, HTTP_OPTIONS).pipe(
            map((response: any) => {
                this.user = response;
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                localStorage.setItem('role', response.role_id.toString());
                localStorage.setItem(
                    'currentUser',
                    JSON.stringify(response)
                );
                this.currentUserService.updateCurrentUser(response);
                this.currentUserService.updateLoggedInStatus(true);
                return response;
            }))
    }

    logout() {
        // remove user from local storage to log user out
        // this.user = undefined;
        this.currentUserService.updateCurrentUser({ username: '' });
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('role');
        this.currentUserService.updateLoggedInStatus(false);

        return of(true);
    }
}
