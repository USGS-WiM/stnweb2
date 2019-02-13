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

@Injectable()

export class AuthenticationService {

  user: User;

  constructor(
    private _http: Http,
    private currentUserService: CurrentUserService
  ) {

  }

  login(username: string, password: string) {
    const options = new RequestOptions({ headers: new Headers({ 'Authorization': 'Basic ' + btoa(username + ':' + password) }) });

    const self = this;
    return this._http.post(APPSETTINGS.AUTH_URL, null, options)
      .map((res: any) => {
        self.user = res.json();
        // if (self.user.is_staff || self.user.username == 'testuser') {
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('password', password);
        sessionStorage.setItem('firstName', self.user.firstName);
        sessionStorage.setItem('lastName', self.user.lastName);
        sessionStorage.setItem('email', self.user.email);
        sessionStorage.setItem('primaryPhone', self.user.primaryPhone.toString());
        sessionStorage.setItem('secondaryPhone', self.user.secondaryPhone.toString());
        sessionStorage.setItem('agency', self.user.agency.toString());
        sessionStorage.setItem('roleID', self.user.roleID.toString());
        sessionStorage.setItem('otherInfo', self.user.otherInfo.toString());

        sessionStorage.setItem('currentUser', JSON.stringify(self.user));

        // self.userLoggedIn$.emit(res);
        // this.currentUser.emit(res);
        this.currentUserService.updateCurrentUser(self.user);
        // } else {

        //   alert('This user is not authorized!');
        // }
      });

  }

  logout() {

    // this.router.navigate(['/login']);
    // this.router.navigateByUrl('login');
    this.user = undefined;
    this.currentUserService.updateCurrentUser({ 'username': '' });
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('password');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('agency');
    sessionStorage.removeItem('roleID');
    sessionStorage.removeItem('primaryPhone');
    sessionStorage.removeItem('secondayPhone');
    sessionStorage.removeItem('otherInfo');

    sessionStorage.removeItem('currentUser');

    // return Observable.of(true);

  }



}

