import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { HttpClient } from '@angular/common/http';

import { Agency } from '@interfaces/agency';
import { APP_UTILITIES } from '@app/app.utilities';

@Injectable({
  providedIn: 'root'
})
export class AgencyService {

  constructor(private httpClient: HttpClient) { }
  // retrieve the full events list
  public getAllAgencies(): Observable<Agency[]> {
    return (
      this.httpClient
        // .get(APP_SETTINGS.EVENTS + '.json', {
        //     headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        // })
        .get(APP_SETTINGS.AGENCIES + '.json')
        .pipe(
          tap((response) => {
            return response;
          }),
          catchError(
            APP_UTILITIES.handleError<any>('getAllAgencies', [])
          )
        )
    );
  }
  public getAnAgency(id): Observable<Agency> {
    return (
      this.httpClient
        .get(APP_SETTINGS.AGENCIES + '/' + id + '.json', { headers: APP_SETTINGS.AUTH_JSON_HEADERS, })
        .pipe(
          tap((response) => {
            return response;
          }),
          catchError(
            APP_UTILITIES.handleError<any>('getAnAgency', [])
          )
        )
    );
  }
}
