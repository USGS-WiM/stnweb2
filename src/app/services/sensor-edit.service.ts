import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '@app/app.settings';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DateTime } from "luxon";

@Injectable({
  providedIn: 'root'
})
export class SensorEditService {

  constructor(private httpClient: HttpClient) { }

  //Get Sensor Type Lookup
  public getSensorTypeLookup(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'SensorTypes.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getSensorTypeLookup response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getSensorTypeLookup', []))
        );
  }

  //Get Sensor Brand Lookup
  public getSensorBrandLookup(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'SensorBrands.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getSensorBrandLookup response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getSensorBrandLookup', []))
        );
  }

  //Get Sensor Brand Lookup
  public getCollectConditions(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'InstrCollectConditions.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getCollectConditions response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getCollectConditions', []))
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
