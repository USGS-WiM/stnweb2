import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { APP_SETTINGS } from '../app.settings';

@Injectable({
  providedIn: 'root'
})
export class OpEditService {

  constructor(private httpClient: HttpClient) { }

    //Update existing reference datum by ID
    public putReferenceDatum(opID: string, op): Observable<any> {
      return this.httpClient
          .put(APP_SETTINGS.API_ROOT + 'ObjectivePoints/' + opID + '.json', op, {
            headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
          .pipe(
              tap((response) => {
                  console.log(
                      'putReferenceDatum response received' //: ' +
                      // JSON.stringify(response)
                  );
                  return response;
              }),
              catchError(this.handleError<any>('putReferenceDatum', []))
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
