import { APP_SETTINGS } from '../app.settings';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SitesService {
    constructor(private http: HttpClient) {}

    private eventSitesSubject: Subject<any>;

    public get eventSites(): Observable<any> {
        return this.eventSitesSubject.asObservable();
    }

    //TODO: create interface for EventSite???
    public getEventSites(eventID: string) {
        const url = APP_SETTINGS.EVENTS + '/' + eventID + '/Sites.json';
        const headers = APP_SETTINGS.AUTH_JSON_HEADERS;
        return this.http
            .get<any>(url, { headers })
            .subscribe(
                (res: any) => {
                    console.log('getting sites for: ' + eventID);
                    this.eventSitesSubject.next(res);
                },
                (err) => {
                    console.log(`http error getting {{eventID}}`);
                },
                () => {
                    console.log('getEvents successful for event: ' + eventID);
                }
            );
    }
    ////..Site format from API
    /* 0: Object
  site_id: 3149
  site_no: "FLIND03149"
  site_name: "SSS-FL-IND-001WL"
  site_description: "Sebastian Inlet State Park,"
  address: "A1A"
  city: "Sebastian"
  state: "FL"
  zip: ""
  other_sid: ""
  county: "Indian River County"
  waterbody: "Sebastian Inlet intracoastal"
  latitude_dd: 27.85508
  longitude_dd: -80.45208
  hdatum_id: 2
  zone: ""
  is_permanent_housing_installed: ""
  usgs_sid: ""
  noaa_sid: ""
  hcollect_method_id: 1
  site_notes: "Sensor on second piling from land on east side of fishing pier in Sebastian Inlet State Park 0.5 miles west of entrance station south of bridge."
  safety_notes: ""
  access_granted: ""
  last_updated: "2019-09-10T16:36:00.13484"
  last_updated_by: 3
   network_name_site: Array [0]
   network_type_site: Array [0]
   objective_points: Array [0]
   instruments: Array [5]
   files: Array [0]
   site_housing: Array [0]
   hwms: Array [3] */
}
