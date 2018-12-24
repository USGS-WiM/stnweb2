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

  constructor(private _http: Http) { }

  public getEventIceCondtion(eventQuery) {

  }

  public getOneEvent(eventID): Observable<IceJam> {
    return this._http.get(APPSETTINGS.EVENTS_URL + eventID)
    .map ((response: Response) => <IceJam>response.json())
    .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(JSON.stringify(error.json()) || 'Server error');
  }

}
