import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { APP_UTILITIES } from '@app/app.utilities';

declare let L: any;
import 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class StreamgageService {

  constructor(private httpClient: HttpClient) {}

  public getStreamGages(bbox): Observable<any> {
      let parameterCodeList = "00065,63160,72214"; // 62619,62620 moved to seperate layer
      let siteTypeList = "OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS";
      let siteStatus = "active";
      let url =
          "https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=" + bbox + "&parameterCd=" +
          parameterCodeList +
          "&siteType=" +
          siteTypeList +
          "&siteStatus=" +
          siteStatus;
      return this.httpClient
          .get(url, {
              headers: APP_SETTINGS.AUTH_XML_HEADERS, responseType: 'text'
          })
          .pipe(
              tap((response) => {
                  return response;
              }),
              catchError(APP_UTILITIES.handleError<any>('getStreamGages', {}))
          );
  }

  public getSingleGage(siteCode, timeQueryRange): Observable<any> {
      let parameterCodeList = "00065,63160,72279";
      let url =
          "https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=" +
          siteCode +
          "&parameterCd=" +
          parameterCodeList +
          timeQueryRange
      return this.httpClient
          .get(url, {
              headers: APP_SETTINGS.AUTH_XML_HEADERS, responseType: 'json'
          })
          .pipe(
              tap((response) => {
                  return response;
              }),
              catchError(APP_UTILITIES.handleError<any>('getSingleGage', {}))
          );
  }

  // Markers for stream gage Layers
  public streamGageMarkers = new L.featureGroup([]);
}
