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
