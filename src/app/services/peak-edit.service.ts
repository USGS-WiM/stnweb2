import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '@app/app.settings';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PeakEditService {

  constructor(private httpClient: HttpClient) { }

  //Get peak summary
  public getPeakSummary(peak_summary_id): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'PeakSummaries/' + peak_summary_id + '.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getPeakSummary response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getPeakSummary', []))
        );
  }

  //Get peak summary data files
  public getPeakDataFiles(peak_summary_id): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'PeakSummaries/' + peak_summary_id + '/DataFiles.json', {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'getPeakDataFiles response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getPeakDataFiles', []))
        );
  }

  // Update peak
  public putPeak(peak_summary_id, peak): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'PeakSummaries/' + peak_summary_id + '.json', peak, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'putPeak response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('putPeak', []))
        );
  }

  // Create peak
  public postPeak(peak): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'PeakSummaries.json', peak, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'postPeak response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('postPeak', []))
        );
  }

  // Update Data File
  public updateDF(data_file_id, df): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'DataFiles/' + data_file_id + '.json', df, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'updateDF response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('updateDF', []))
        );
  }

  // Update HWM
  public updateHWM(hwm_id, hwm): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'hwms/' + hwm_id + '.json', hwm, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'updateHWM response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('updateHWM', []))
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
