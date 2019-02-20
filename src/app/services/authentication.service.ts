import { Injectable, Output } from '@angular/core';
// import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/observable/of';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { APPSETTINGS } from '../app.settings';
import { User } from '../interfaces/user';
import { EventEmitter } from 'events';

import { BehaviorSubject } from 'rxjs';
import { CurrentUserService } from '../services/current-user.service';

@Injectable({ providedIn: 'root' })

export class AuthenticationService {
  user: User;

  constructor(private _http: Http,
    private currentUserService: CurrentUserService
    ) { }

  login(username: string, password: string) {
    const options = new RequestOptions({
      headers: new Headers({
        'Authorization': 'Basic ' + btoa(username + ':' + password)
      })
    });
    const self = this;
    return this._http.get(APPSETTINGS.AUTH_URL, options)
      .map((res: any) => {
        self.user = res.json();
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('password', password);
        sessionStorage.setItem('observerID', self.user.id.toString());
        sessionStorage.setItem('currentUser', JSON.stringify(self.user));
        this.currentUserService.updateCurrentUser(self.user);
        // login successful if there's a user in the response
        /* if (res) {
          // store user details and basic auth credentials in local storage
          // to keep user logged in between page refreshes
          res.authdata = window.btoa(username + ':' + password);
          localStorage.setItem('currentUser', JSON.stringify(res));
          console.log(res);
        } */

        return res;
      });
  }

  logout() {
    // remove user from local storage to log user out
    this.user = undefined;
    this.currentUserService.updateCurrentUser({ 'username': '' });
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('password');
    sessionStorage.removeItem('observerID');
    sessionStorage.removeItem('currentUser');
  }
}
