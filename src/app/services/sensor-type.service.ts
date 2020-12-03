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
export class SensorTypeService {
    sensorTypes$: Observable<any>;

    constructor(private httpClient: HttpClient) {
        this.sensorTypes$ = httpClient
            .get(APP_SETTINGS.SENSOR_TYPES + '.json')
            .pipe(
                shareReplay(1),
                tap(() => console.log('after sharing')),
                catchError(
                    APP_UTILITIES.handleError<any>(
                        'SensorTypeService httpClient GET',
                        []
                    )
                )
            );
    }

    public getSensorTypes(): Observable<any> {
        return this.httpClient.get(APP_SETTINGS.SENSOR_TYPES + '.json').pipe(
            tap((response) => {
                console.log('Sensor types list response recieved: ' + response);
                return response;
            }),
            catchError(APP_UTILITIES.handleError<any>('getSensorTypes', []))
        );
    }

    // GET ONE Sensor Type
    public getSensorType(sensor_type_id: number): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SENSOR_TYPES + sensor_type_id + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                map((response: Response) => {
                    return response;
                })
            );
    }
}
