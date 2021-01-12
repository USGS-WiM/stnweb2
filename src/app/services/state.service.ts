import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { APP_UTILITIES } from '@app/app.utilities';

@Injectable({
    providedIn: 'root',
})
export class StateService {
    states$: Observable<any>;
    eventStates$: Observable<any>;
    constructor(private httpClient: HttpClient) {
        this.states$ = httpClient.get(APP_SETTINGS.STATES + '.json').pipe(
            shareReplay(1),
            tap(() => console.log('after sharing')),
            catchError(
                APP_UTILITIES.handleError<any>(
                    'StateService httpClient GET',
                    []
                )
            )
        );
        this.eventStates$ = httpClient.get(APP_SETTINGS.STATES + '.json').pipe(
            shareReplay(1),
            tap(() => console.log('after sharing')),
            catchError(
                APP_UTILITIES.handleError<any>(
                    'StateService httpClient GET',
                    []
                )
            )
        );
    }

    public getStates(): Observable<any> {
        return this.httpClient.get(APP_SETTINGS.STATES + '.json').pipe(
            tap((response) => {
                return response;
            }),
            catchError(APP_UTILITIES.handleError<any>('getStates', []))
        );
    }

    // GET ONE State
    public getState(state_id: number): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.STATES + state_id + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }
}
