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

  // GET ONE SITE
  public getEventDetails(siteID): Observable<Site> {
    /* if (sessionStorage.username !== undefined) {
      options = new RequestOptions({
        headers: APP_SETTINGS.MIN_AUTH_JSON_HEADERS
      });
    } else {
      options = new RequestOptions({
        headers: APP_SETTINGS.JSON_HEADERS
      });
    } */

    return this._http.get(APPSETTINGS.EVENTS_URL + siteID)
      .map((response: Response) => <Site>response.json())
      .catch(this.handleError);
  }

  // POST NEW SITE
  public create(formValue): Observable<Site> {

    const options = new RequestOptions({
      headers: APPSETTINGS.AUTH_JSON_HEADERS
    });

    return this._http.post(APPSETTINGS.SITES_URL, formValue, options)
      .map((response: Response) => <Site>response.json())
      .catch(this.handleError);
  }

  // UPDATE SITE
  public update(formValue): Observable<Site> {
    return this._http.put(APPSETTINGS.EVENTS_URL + formValue.id + '/', formValue)
      .map((response: Response) => <Site>response.json())
      .catch(this.handleError);
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(JSON.stringify(error.json()) || 'Server error');
  }
}
