import { Injectable } from '@angular/core';
import { APPSETTINGS } from '../app.settings';
import { RiverConditionType } from '../interfaces/river-condition-type';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RiverConditionTypeService {

  constructor(private _http: Http) { }

  public getRiverConditionTypes(): Observable<RiverConditionType[]> {
    return this._http.get(APPSETTINGS.RIVER_CONDITION_TYPES)
      .map((response: Response) => <RiverConditionType[]>response.json())
      .catch(this.handleError);
  }
  private handleError(error: Response) {
    console.error(error);
    return throwError(JSON.stringify(error.json()) || 'Server error');
  }
}
