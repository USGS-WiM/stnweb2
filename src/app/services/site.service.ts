import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';
import { APPSETTINGS } from '../app.settings';
import { Site } from '../interfaces/site';

@Injectable({
  providedIn: 'root'
})
export class SiteService {

  constructor(private _http: Http) { }

  public getAllSites(): Observable<Site[]> {
    return this._http.get(APPSETTINGS.SITES_URL)
      .map((response: Response) => <Site[]>response.json())
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(JSON.stringify(error.json()) || 'Server error');
  }
}
