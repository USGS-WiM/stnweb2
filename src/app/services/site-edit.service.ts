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
  public putSite(siteID: string, site): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.SITES_URL + '/' + siteID + '.json', site, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'putSite response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('putSite', []))
        );
  }

  // Put landowner
  public putLandowner(landownerContactID, landowner): Observable<any> {
    // rootURL + '/LandOwners/:id.json'
    return this.httpClient
        .put(APP_SETTINGS.SITES_URL + '/LandOwners/' + landownerContactID + '.json', landowner, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'putLandowner response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('putLandowner', []))
        );
  }

  public postLandowner(landowner): Observable<any> {
    // rootURL + '/LandOwners/:id.json'
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'LandOwners.json',  landowner, {
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
        .post(APP_SETTINGS.API_ROOT + 'sites/' + siteID + '/AddNetworkName?NetworkNameId=' + networkNameID, { siteId: siteID, NetworkNameId: networkNameID }, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
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
        .delete(APP_SETTINGS.SITES_URL + '/' + siteID + '/removeNetworkName?NetworkNameId=' + networkNameID,  {
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
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'sites/' + siteID + '/AddNetworkType?NetworkTypeId=' + networkTypeID, { siteId: siteID, NetworkNameId: networkTypeID }, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
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
        .delete(APP_SETTINGS.API_ROOT + 'sites/' + siteID + '/removeNetworkType?NetworkTypeId=' + networkTypeID, {
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
        .delete(APP_SETTINGS.API_ROOT + 'SiteHousings/' + siteHousingID + '.json',  {
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

  public postSiteHousings(housing): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'SiteHousings.json', housing, {
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

  public putSiteHousings(siteHousingID, siteHousing): Observable<any> {
    // rootURL + '/SiteHousings/:id.json'
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'SiteHousings/' + siteHousingID + '.json', siteHousing, {
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

  public postSource(source): Observable<any> {
    // rootURL + '/Sources/:id.json'
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + '/Sources.json', source, {
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
  
  public uploadFile(file): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'Files/bytes',  file, {
            headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'uploadFile response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('uploadFile', []))
        );
  }

  public saveFile(file): Observable<any> {
      return this.httpClient
          .post(APP_SETTINGS.API_ROOT + 'Files.json', file, {
            headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
          .pipe(
              tap((response) => {
                  console.log(
                      'saveFile response received' //: ' +
                      // JSON.stringify(response)
                  );
                  return response;
              }),
              catchError(this.handleError<any>('saveFile', []))
          );
    }

    public updateFile(file): Observable<any> {
        return this.httpClient
            .put(APP_SETTINGS.API_ROOT + 'Files/' + file.file_id + '.json',  file, {
              headers: APP_SETTINGS.AUTH_JSON_HEADERS,
          })
            .pipe(
                tap((response) => {
                    console.log(
                        'updateFile response received' //: ' +
                        // JSON.stringify(response)
                    );
                    return response;
                }),
                catchError(this.handleError<any>('updateFile', []))
            );
      }

  public deleteFile(fileID): Observable<any> {
      return this.httpClient
          .delete(APP_SETTINGS.API_ROOT + 'Files/' + fileID + '.json', {
            headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
          .pipe(
              tap((response) => {
                  console.log(
                      'deleteFile response received' //: ' +
                      // JSON.stringify(response)
                  );
                  return response;
              }),
              catchError(this.handleError<any>('deleteFile', []))
          );
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
