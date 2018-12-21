import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { APPSETTINGS } from '../app.settings';
import { IceCondition } from '../interfaces/ice-condition';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';
import { IceJam } from '../interfaces/ice-jam';

@Injectable({
  providedIn: 'root'
})
export class IceJamService {

  constructor(private _http: Http) { }

  public getEventIceCondtion(eventQuery) {

  }

  public getOneEvent(eventID): Observable<IceJam> {
    return this._http.get(APPSETTINGS.EVENTS_URL + eventID)
  }

}
