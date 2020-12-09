import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class NetworkNamesService {
    constructor(private httpClient: HttpClient) {}

    public getNetworkNames(): Observable<any> {
        return this.httpClient.get(APP_SETTINGS.NETWORK_NAMES + '.json').pipe(
            tap((response) => {
                console.log(
                    'Network list response received: ' +
                        JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('getNetworkNames', []))
        );
    }

    // GET ONE Network Name
    public getNetworkName(network_name_id: number): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.NETWORK_NAMES + network_name_id + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    /* istanbul ignore next */
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
