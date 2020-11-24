import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Rx';
// import 'rxjs/add/operator/map';
// import 'rxjs/observable/of';
import { APP_SETTINGS } from '../app.settings';
import { HttpClient } from '@angular/common/http';

import { CurrentUserService } from '@services/current-user.service';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    user;

    constructor(
        private http: HttpClient,
        private currentUserService: CurrentUserService
    ) {}
    // TODO: test this
    login(username: string, password: string) {
        // const options = new RequestOptions({
        //     headers: new Headers({
        //         Authorization: 'Basic ' + btoa(username + ':' + password),
        //     }),
        // });
        const self = this;
        return this.http
            .get(APP_SETTINGS.AUTH_URL, {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .map((res: any) => {
                self.user = res.json();
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                localStorage.setItem('observerID', self.user.id.toString());
                localStorage.setItem('currentUser', JSON.stringify(self.user));
                this.currentUserService.updateCurrentUser(self.user);
                return res;
            });
        // login successful if there's a user in the response
        /* if (res) {
            // store user details and basic auth credentials in local storage
            // to keep user logged in between page refreshes
            res.authdata = window.btoa(username + ':' + password);
            localStorage.setItem('currentUser', JSON.stringify(res));
            console.log(res);
          } */
    }

    logout() {
        // remove user from local storage to log user out
        // this.user = undefined;
        this.currentUserService.updateCurrentUser({ username: '' });
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('observerID');
        localStorage.removeItem('currentUser');

        return of(true);
    }
}
