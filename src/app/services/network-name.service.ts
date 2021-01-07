import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { HttpClient } from '@angular/common/http';
import { APP_UTILITIES } from '@app/app.utilities';

@Injectable({
    providedIn: 'root',
})
export class NetworkNameService {
    networks$: Observable<any>;

    constructor(private httpClient: HttpClient) {
        this.networks$ = httpClient
            .get(APP_SETTINGS.NETWORK_NAMES + '.json')
            .pipe(
                shareReplay(1),
                tap(() => console.log('after sharing')),
                catchError(
                    APP_UTILITIES.handleError<any>(
                        'NetworkNameService httpClient GET',
                        []
                    )
                )
            );
    }

    // this has been replaced with the networks$ variable
    public getNetworkNames(): Observable<any> {
        return this.httpClient.get(APP_SETTINGS.NETWORK_NAMES + '.json').pipe(
            tap((response) => {
                console.log(
                    'Network list response received' /*:  + response */
                );
                return response;
            }),
            catchError(APP_UTILITIES.handleError<any>('getNetworkNames', []))
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
}
