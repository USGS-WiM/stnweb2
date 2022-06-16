import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '@app/app.settings';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileEditService {

  constructor(private httpClient: HttpClient) { }

  // Delete file
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

  // Add file (except link)
  public uploadFile(file): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'Files/bytes', file, {
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

  // Add file (link)
  public addFile(file): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'Files.json', file, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'addFile response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('addFile', []))
        );
  }

  // Update file
  public updateFile(fileID, file): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'Files/' + fileID + '.json', file, {
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

  // Update data file
  public updateDataFile(datafileID, datafile): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'DataFiles/' + datafileID + '.json', datafile, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'updateDataFile response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('updateDataFile', []))
        );
  }

  // Add data file
  public addDataFile(datafile): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'DataFiles.json', datafile, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'addDataFile response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('addDataFile', []))
        );
  }

  // Delete data file
  public deleteDataFile(datafile_id): Observable<any> {
    return this.httpClient
        .delete(APP_SETTINGS.API_ROOT + 'DataFiles' + datafile_id + '.json', {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'deleteDataFile response received' //: ' +
                    // JSON.stringify(response)
                );
                return response;
            }),
            catchError(this.handleError<any>('deleteDataFile', []))
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
