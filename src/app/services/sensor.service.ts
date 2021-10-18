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

import { Event } from '@interfaces/event';
import { Sitefullsensors } from '@interfaces/sitefullsensors';
import { APP_UTILITIES } from '@app/app.utilities';

@Injectable({
    providedIn: 'root',
})
export class SensorService {
    constructor(private httpClient: HttpClient) {}

    // retrieve all sensors for a single site
    public getSiteFullInstruments(siteID): Observable<Sitefullsensors[]> {
        return this.httpClient
            .get(
                APP_SETTINGS.SITES_URL +
                    '/' +
                    siteID +
                    '/SiteFullInstrumentList.json',
                {
                    headers: APP_SETTINGS.AUTH_JSON_HEADERS,
                }
            )
            .pipe(
                tap((response) => {
                    return response;
                }),
                catchError(
                    APP_UTILITIES.handleError<any>('getSiteFullInstruments', {})
                )
            );
    }

    // retrieve all site sensors for an event -- currently not in use
    public getSiteEventInstruments(siteID, eventID): Observable<Event> {
        return this.httpClient
            .get(
                APP_SETTINGS.SITES_URL +
                    '/' +
                    siteID +
                    '/Instruments.json?' +
                    'Event=' +
                    eventID,
                {
                    headers: APP_SETTINGS.AUTH_JSON_HEADERS,
                }
            )
            .pipe(
                tap((response) => {
                    return response;
                }),
                catchError(
                    APP_UTILITIES.handleError<any>(
                        'getSiteEventInstruments',
                        {}
                    )
                )
            );
    }
}
