import { Injectable } from '@angular/core';
import { APPSETTINGS } from '../app.settings';
import { RoughnessType } from '../interfaces/roughness-type';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoughnessTypeService {

  constructor(private _http: Http) { }

  public getRoughnessTypes(): Observable<RoughnessType[]> {
    return this._http.get(APPSETTINGS.ROUGHNESS_TYPES_URL)
      .map((response: Response) => <RoughnessType[]>response.json())
      .catch(this.handleError);
  }
  private handleError(error: Response) {
    console.error(error);
    return throwError(JSON.stringify(error.json()) || 'Server error');
  }
}
