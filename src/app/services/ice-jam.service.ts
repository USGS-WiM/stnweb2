import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';
import { APPSETTINGS } from '../app.settings';

import { IceJam } from '../interfaces/ice-jam';
import { IceCondition } from '../interfaces/ice-condition';

@Injectable()
export class IceJamService {
    constructor(private _http: Http) {}

    // GET ALL EVENTS
    public getAllEvents(): Observable<IceJam[]> {
        return this._http
            .get(APPSETTINGS.EVENTS_URL)
            .map((response: Response) => <IceJam[]>response.json())
            .catch(this.handleError);
    }

    // GET ONE EVENT
    public getEventDetails(eventID): Observable<IceJam> {
        /* if (sessionStorage.username !== undefined) {
      options = new RequestOptions({
        headers: APP_SETTINGS.MIN_AUTH_JSON_HEADERS
      });
    } else {
      options = new RequestOptions({
        headers: APP_SETTINGS.JSON_HEADERS
      });
    } */

        return this._http
            .get(APPSETTINGS.EVENTS_URL + eventID)
            .map((response: Response) => <IceJam>response.json())
            .catch(this.handleError);
    }

    // POST NEW EVENT
    public create(formValue): Observable<IceJam> {
        const options = new RequestOptions({
            headers: APPSETTINGS.AUTH_JSON_HEADERS,
        });

        return this._http
            .post(APPSETTINGS.EVENTS_URL, formValue, options)
            .map((response: Response) => <IceJam>response.json())
            .catch(this.handleError);
    }

    // UPDATE EVENT
    public update(formValue): Observable<IceJam> {
        return this._http
            .put(APPSETTINGS.EVENTS_URL + formValue.id + '/', formValue)
            .map((response: Response) => <IceJam>response.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        console.error(error);
        return throwError(JSON.stringify(error.json()) || 'Server error');
    }
}
