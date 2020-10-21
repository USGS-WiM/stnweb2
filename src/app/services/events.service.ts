import { Injectable } from '@angular/core';
import { APPSETTINGS } from '../app.settings';
import { Events } from '../interfaces/events';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EventsService {
    constructor(private _http: Http) {}

    public getAllEvents(): Observable<Events[]> {
        return this._http
            .get(APPSETTINGS.EVENTS + '.json')
            .map((response: Response) => <Events[]>response.json())
            .catch(this.handleError);
    }

    // GET ONE Event
    public getAnEvent(eventID): Observable<Events> {
        return this._http
            .get(APPSETTINGS.EVENTS + eventID + '.json')
            .map((response: Response) => <Events>response.json())
            .catch(this.handleError);
    }

    // GET Event Sites. Used to populate map.
    public getEventSites(eventID): Observable<Events> {
        return this._http
            .get(APPSETTINGS.EVENTS + '/' + eventID + '/Sites.json')
            .map((response: Response) => <Events>response.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        console.error(error);
        return throwError(JSON.stringify(error.json()) || 'Server error');
    }
}
