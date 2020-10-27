import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EventsService {
    // TODO: replace Http with HttpClient
    constructor() {}

    // public getAllEvents(): Observable<Events[]> {
    //   return this._http.get(APP_SETTINGS.EVENTS + '.json')
    //     .map((response: Response) => <Events[]>response.json())
    //     .catch(this.handleError);
    // }

    // GET ONE Event
    // public getAnEvent(eventID): Observable<Events> {
    //   return this._http.get(APP_SETTINGS.EVENTS + eventID + '.json')
    //     .map((response: Response) => <Events>response.json())
    //     .catch(this.handleError);
    // }

    // GET Event Sites. Used to populate map.
    // public getEventSites(eventID): Observable<Events> {
    //   return this._http.get(APP_SETTINGS.EVENTS + '/' + eventID + '/Sites.json')
    //     .map((response: Response) => <Events>response.json())
    //     .catch(this.handleError);
    // }

    private handleError(error: Response) {
        console.error(error);
        return throwError(JSON.stringify(error.json()) || 'Server error');
    }
}
