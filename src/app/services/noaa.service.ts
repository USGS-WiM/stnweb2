import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { EMPTY, Subject } from 'rxjs';

declare let L: any;
import 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class NoaaService {

  constructor(private httpClient: HttpClient) {}

  // NOAA Tide and Current Stations
  public getTides(): Observable<any> {
    return this.httpClient.get('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json').pipe(
        tap((response) => {
            console.log('Noaa response received ' /*+ response*/);
            return response;
        }),
        catchError(this.handleError<any>('getTides', []))
    );
  }

  public tideMarkers = new L.featureGroup([]);

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
