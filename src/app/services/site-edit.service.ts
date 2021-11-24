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
  public putSite(siteID: string): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.SITES_URL + '/' + siteID + '.json',  {
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

  // Put landowner
  public putLandowner(landownerContactID): Observable<any> {
    // rootURL + '/LandOwners/:id.json'
    // return this.httpClient
    //     .put(APP_SETTINGS.SITES_URL + '/LandOwners/' + landownerContactID + '.json',  {
    //       headers: APP_SETTINGS.AUTH_JSON_HEADERS,
    //   })
    //     .pipe(
    //         tap((response) => {
    //             console.log(
    //                 'putLandowner response received' //: ' +
    //                 // JSON.stringify(response)
    //             );
    //             return response;
    //         }),
    //         catchError(this.handleError<any>('putLandowner', []))
    //     );
    return landownerContactID;
  }

  public postLandowner(landownerContactID): Observable<any> {
    // rootURL + '/LandOwners/:id.json'
    return this.httpClient
        .post(APP_SETTINGS.SITES_URL + '/LandOwners/' + landownerContactID + '.json',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'postLandowner response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('postLandowner', []))
        );
  }

  public postNetworkNames(siteID, networkNameID): Observable<any> {
    // params: { siteId: '@siteId', NetworkNameId: '@networkNameId' }, isArray: true, url: rootURL + '/sites/:siteId/AddNetworkName'
    return this.httpClient
        .post(APP_SETTINGS.SITES_URL + '/sites' + siteID + 'AddNetworkName',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
          params: { siteId: siteID, NetworkNameId: networkNameID },
      })
        .pipe(
            tap((response) => {
                console.log(
                    'postNetworkNames response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('postNetworkNames', []))
        );
  }

  public deleteNetworkNames(siteID, networkNameID): Observable<any> {
    // url: rootURL + '/sites/:siteId/removeNetworkName?NetworkNameId=:networkNameId'
    return this.httpClient
        .delete(APP_SETTINGS.SITES_URL + '/sites/' + siteID + '/removeNetworkName?NetworkNameId=' + networkNameID,  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'deleteNetworkNames response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('deleteNetworkNames', []))
        );
  }

  public postNetworkTypes(siteID, networkTypeID): Observable<any> {
    // { siteId: '@siteId', NetworkTypeId: '@networkTypeId' }, isArray: true, url: rootURL + '/sites/:siteId/AddNetworkType'
    return this.httpClient
        .post(APP_SETTINGS.SITES_URL + '/sites/' + siteID + '/AddNetworkType',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
          params: { siteId: siteID, NetworkTypeId: networkTypeID },
      })
        .pipe(
            tap((response) => {
                console.log(
                    'postNetworkTypes response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('postNetworkTypes', []))
        );
  }

  public deleteNetworkTypes(siteID, networkTypeID): Observable<any> {
    // url: rootURL + '/sites/:siteId/removeNetworkType?NetworkTypeId=:networkTypeId'
    return this.httpClient
        .delete(APP_SETTINGS.SITES_URL + '/sites/' + siteID + '/removeNetworkType?NetworkTypeId=' + networkTypeID,  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'deleteNetworkTypes response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('deleteNetworkTypes', []))
        );
  }

  public deleteSiteHousings(siteHousingID): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    return this.httpClient
        .delete(APP_SETTINGS.SITES_URL + '/SiteHousings/' + siteHousingID + '.json',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'deleteSiteHousings response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('deleteSiteHousings', []))
        );
  }

  public postSiteHousings(siteHousingID): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    return this.httpClient
        .post(APP_SETTINGS.SITES_URL + '/SiteHousings/' + siteHousingID + '.json',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'postSiteHousings response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('postSiteHousings', []))
        );
  }

  public putSiteHousings(siteHousingID): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    return this.httpClient
        .put(APP_SETTINGS.SITES_URL + '/SiteHousings/' + siteHousingID + '.json',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'putSiteHousings response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('putSiteHousings', []))
        );
  }

  public postSource(sourceID): Observable<any> {
    // rootURL + '/Sources/:id.json'
    return this.httpClient
        .post(APP_SETTINGS.SITES_URL + '/Sources/' + sourceID + '.json',  {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'postSource response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('postSource', []))
        );
  }
  
  public uploadFile(sourceID): Observable<any> {
  // uploadFile: { method: 'POST', url: rootURL + '/Files/bytes', headers: { 'Content-Type': undefined }, transformRequest: angular.identity, cache: false, isArray: false },
    // return this.httpClient
    //     .post(APP_SETTINGS.SITES_URL + 'Files/bytes',  {
    //       headers: APP_SETTINGS.AUTH_JSON_HEADERS,
    //   })
    //     .pipe(
    //         tap((response) => {
    //             console.log(
    //                 'uploadFile response received' //: ' +
    //                 // JSON.stringify(response)
    //             );
    //             return response;
    //         }),
    //         catchError(this.handleError<any>('uploadFile', []))
    //     );
    return sourceID;
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
