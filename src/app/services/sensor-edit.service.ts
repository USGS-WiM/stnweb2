import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '@app/app.settings';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SensorEditService {

  constructor(private httpClient: HttpClient) { }

  //Get Sensor Type Lookup
  public getSensorTypeLookup(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'SensorTypes.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getSensorTypeLookup response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getSensorTypeLookup', []))
        );
  }

  //Get Sensor Brand Lookup
  public getSensorBrandLookup(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'SensorBrands.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getSensorBrandLookup response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getSensorBrandLookup', []))
        );
  }

  //Get Sensor Brand Lookup
  public getCollectConditions(): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + 'InstrCollectConditions.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getCollectConditions response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getCollectConditions', []))
        );
  }

  //Update instrument
  public putInstrument(instrumentID: string, instrument): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'Instruments/' + instrumentID + '.json', instrument, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'putInstrument response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('putInstrument', []))
        );
  }
    
  /* istanbul ignore next */
  //Delete instrument
  public deleteInstrument(instrumentID: string): Observable<any> {
    return this.httpClient
        .delete(APP_SETTINGS.API_ROOT + 'Instruments/' + instrumentID + '.json', {
            headers: APP_SETTINGS.AUTH_JSON_HEADERS,
        })
        .pipe(
            tap((response) => {
                console.log(
                    'deleteInstrument response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('deleteInstrument', []))
        );
  }

  /* istanbul ignore next */
  //Deploy/create instrument
  public postInstrument(instrument): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'Instruments.json', instrument, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'postInstrument response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('postInstrument', []))
        );
  }

  //Update instrument status
  public putInstrumentStatus(instrumentStatusID: string, instrumentStatus): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'InstrumentStatus/' + instrumentStatusID + '.json', instrumentStatus, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'putInstrumentStatus response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('putInstrumentStatus', []))
        );
  }

  /* istanbul ignore next */
  //Create instrument status
  public postInstrumentStatus(instrumentStatus): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'InstrumentStatus.json', instrumentStatus, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'postInstrumentStatus response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('postInstrumentStatus', []))
        );
  }

  // Delete OP Measure (tapedown)
  public deleteOPMeasure(opMeasurementID: string): Observable<any> {
    return this.httpClient
        .delete(APP_SETTINGS.API_ROOT + 'OPMeasurements/' + opMeasurementID + '.json', {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'deleteOPMeasure response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('deleteOPMeasure', []))
        );
  }

  // Update OP Measure (tapedown)
  public updateOPMeasure(opMeasurementID: string, opMeasurement): Observable<any> {
    return this.httpClient
        .put(APP_SETTINGS.API_ROOT + 'OPMeasurements/' + opMeasurementID + '.json', opMeasurement, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'updateOPMeasure response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('updateOPMeasure', []))
        );
  }

  // Add OP Measure (tapedown)
  public addOPMeasure(opMeasurement): Observable<any> {
    return this.httpClient
        .post(APP_SETTINGS.API_ROOT + 'OPMeasurements.json', opMeasurement, {
          headers: APP_SETTINGS.AUTH_JSON_HEADERS,
      })
        .pipe(
            tap((response) => {
                console.log(
                    'addOPMeasure response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('addOPMeasure', []))
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
