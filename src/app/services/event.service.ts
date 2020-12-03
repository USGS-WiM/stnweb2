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
import { APP_UTILITIES } from '@app/app.utilities';

@Injectable({
    providedIn: 'root',
})
export class EventService {
    events$: Observable<any>;
    public events: any;

    constructor(private httpClient: HttpClient) {
        this.events$ = httpClient.get(APP_SETTINGS.EVENTS + '.json').pipe(
            shareReplay(1),
            tap(() => console.log('after sharing'))
        );
    }

    // retrieve the full events list
    public getAllEvents(): Observable<Event[]> {
        return (
            this.httpClient
                // .get(APP_SETTINGS.EVENTS + '.json', {
                //     headers: APP_SETTINGS.AUTH_JSON_HEADERS,
                // })
                .get(APP_SETTINGS.EVENTS + '.json')
                .pipe(
                    tap((response) => {
                        console.log(
                            'Events list response recieved: ' + response
                        );
                        return response;
                    }),
                    catchError(
                        APP_UTILITIES.handleError<any>('getAllEvents', [])
                    )
                )
        );
    }

    // retrieve the details for a single specific event
    public getEvent(eventID): Observable<Event> {
        return this.httpClient
            .get(APP_SETTINGS.EVENTS + eventID + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log('Event record response recieved: ' + response);
                    return response;
                }),
                catchError(APP_UTILITIES.handleError<any>('getEvent', {}))
            );
    }

    // retrieve the details for a single specific event
    public filterEvents(query): Observable<Event[]> {
        //TODO: parse the query into a url query string
        let queryString = '';
        return this.httpClient
            .get(APP_SETTINGS.EVENTS + 'FilteredEvents.json' + queryString, {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log('Event query response recieved: ' + response);
                    return response;
                }),
                catchError(APP_UTILITIES.handleError<any>('filterEvents', {}))
            );
    }
}
