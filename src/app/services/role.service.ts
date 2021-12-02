import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { HttpClient } from '@angular/common/http';

import { Role } from '@interfaces/role';
import { APP_UTILITIES } from '@app/app.utilities';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private httpClient: HttpClient) { }

  // getall roles
  public getAllRoles(): Observable<Role[]> {
    return (
      this.httpClient
        .get(APP_SETTINGS.AGENCIES + '.json')
        .pipe(
          tap((response) => {
            return response;
          }),
          catchError(
            APP_UTILITIES.handleError<any>('getAllRoles', [])
          )
        )
    );
  }
}
