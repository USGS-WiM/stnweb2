import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class StatesService {
    constructor(private httpClient: HttpClient) {}

    public getStates(): Observable<any> {
        return this.httpClient.get(APP_SETTINGS.STATES + '.json').pipe(
            tap((response) => {
                console.log('State list response recieved: ' + response);
                return response;
            }),
            catchError(this.handleError<any>('getStates', []))
        );
    }

    // GET ONE State
    public getOneState(state_id: number): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.STATES + state_id + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                map((response: Response) => {
                    return response.json();
                })
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
