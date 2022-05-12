import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '@app/app.settings';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HwmEditService {

  constructor(private httpClient: HttpClient) { }

  //Get HWM Type Lookup
  public getHWMTypeLookup(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'HWMTypes.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getHWMTypeLookup response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getHWMTypeLookup', []))
        );
  }

  //Get HWM Marker Lookup
  public getHWMMarkerLookup(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'Markers.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getHWMMarkerLookup response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getHWMMarkerLookup', []))
        );
  }

  //Get HWM Quality Lookup
  public getHWMQualityLookup(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'HWMQualities.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getHWMQualityLookup response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getHWMQualityLookup', []))
        );
  }

  //Get Approval
  public getApproval(approval_id): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'Approvals/' + approval_id + '.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getApproval response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getApproval', []))
        );
  }

  //Update a HWM
  public putHWM(hwm_id, hwm): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'hwms/' + hwm_id + '.json', hwm, {
            headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'putHWM response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('putHWM', []))
        );
  }

  /* istanbul ignore next */
  //Create a HWM
  public postHWM(hwm): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'hwms.json', hwm, {
            headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'postHWM response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('postHWM', []))
        );
  }

  /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */

   private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead

        // TODO: better job of transforming error for user consumption
        // Consider creating a message service for this (https://angular.io/tutorial/toh-pt4)
        console.log(`${operation} failed: ${error.message}`);

        // Let the app keep running by returning an empty result.
        return of(result as T);
    };
  }
}
