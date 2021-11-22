import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SiteEditService {

  constructor(private httpClient: HttpClient) {
  }

  //Update single site by ID
  public updateSingleSite(siteID: string): Observable<any> {
    console.log(APP_SETTINGS.SITES_URL);
    return this.httpClient
        .get(APP_SETTINGS.SITES_URL + '/' + siteID + '.json',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'updateSingleSite response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('updateSingleSite', []))
        );
  }

  // Post site info
  public submitForm(data): Observable<any> {
    console.log(data)
    return data;
    // return this.httpClient.post<any>(api-url, data);
  }

  // Put landowner
  public putLandowner(data): Observable<any> {
    console.log(data)
    return data;
  }

  public postLandowner(data): Observable<any> {
    console.log(data)
    return data;
  }

  public postNetworkNames(data): Observable<any> {
    // params: { siteId: '@siteId', NetworkNameId: '@networkNameId' }, isArray: true, url: rootURL + '/sites/:siteId/AddNetworkName'
    console.log(data)
    return data;
  }

  public deleteNetworkNames(data): Observable<any> {
    // url: rootURL + '/sites/:siteId/removeNetworkName?NetworkNameId=:networkNameId'
    console.log(data)
    return data;
  }

  public postNetworkTypes(data): Observable<any> {
    // { siteId: '@siteId', NetworkTypeId: '@networkTypeId' }, isArray: true, url: rootURL + '/sites/:siteId/AddNetworkType'
    console.log(data)
    return data;
  }

  public deleteNetworkTypes(data): Observable<any> {
    // url: rootURL + '/sites/:siteId/removeNetworkType?NetworkTypeId=:networkTypeId'
    console.log(data)
    return data;
  }

  public deleteSiteHousings(data): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    console.log(data)
    return data;
  }

  public postSiteHousings(data): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    console.log(data)
    return data;
  }

  public putSiteHousings(data): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    console.log(data)
    return data;
  }

  /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead

        // TODO: better job of transforming error for user consumption
        // Consider creating a message service for this (https://angular.io/tutorial/toh-pt4)
        console.log(`${operation} failed: ${error.message}`);

        // Let the app keep running by returning an empty result.
        return of(result as T);
    };
  }
}
