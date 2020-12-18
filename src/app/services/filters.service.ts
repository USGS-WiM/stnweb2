import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { SiteService } from '@services/site.service';

declare let L: any;
import 'leaflet';

@Injectable({
    providedIn: 'root',
})
export class FiltersService {
    constructor(public siteService: SiteService) {}

    public eventMarkers;

    public mapResults(
        eventSites: any,
        myIcon: any,
        layerType: any,
        zoomToLayer: boolean
    ) {
        // loop through results response from a search query
        if (eventSites.length !== undefined) {
            this.eventMarkers = layerType;
            for (let site of eventSites) {
                let lat = Number(site.latitude_dd);
                let long = Number(site.longitude_dd);

                let popupContent =
                    '<h3>' +
                    '<span class="popupLabel"><b>Site Identifier</b>:</span> ' +
                    site.site_name +
                    '</h3>' +
                    '<span class="popupLabel"><b>State</b>:</span> ' +
                    site.state +
                    '<br/>' +
                    '<span class="popupLabel"><b>County</b>:</span> ' +
                    site.county +
                    '<br/>' +
                    '<span class="popupLabel"><b>Waterbody</b>:</span> ' +
                    site.waterbody +
                    '<br/>';

                site.is_permanent_housing_installed
                    ? (popupContent +=
                          '<span class="popupLabel"><b>Permanent Housing installed?</b>:</span> ' +
                          site.is_permanent_housing_installed +
                          '<br/>')
                    : (popupContent +=
                          '<span class="popupLabel"><b>Permanent Housing installed?</b>:</span> ' +
                          'No<br/>');

                if (site.Events) {
                    popupContent +=
                        '<span class="popupLabel"><b>Event(s)</b>:</span> ' +
                        site.Events.toString() +
                        '<br/>';
                }

                /* istanbul ignore next */
                if (isNaN(lat) || isNaN(long)) {
                    console.log(
                        'Skipped site ' +
                            site.site_no +
                            ' in All STN Sites layer due to null lat/lng'
                    );
                } else {
                    //put all the event markers in the same layer group
                    if (layerType == this.eventMarkers) {
                        L.marker([lat, long], { icon: myIcon })
                            .bindPopup(popupContent)
                            .addTo(layerType);
                    }
                    //Make circle markers for the All STN Sites layer
                    if (layerType == this.siteService.siteMarkers) {
                        L.marker([lat, long], {
                            icon: myIcon,
                            iconSize: 32,
                        })
                            .bindPopup(popupContent)
                            .addTo(layerType);
                    }
                }
            }
        }
        if (layerType == this.eventMarkers) {
            return this.eventMarkers;
        }
    }

    private _eventMarkers: Subject<any> = new Subject<any>();
    public setEventMarkers(val: any) {
        this.eventMarkers = val;
        this._eventMarkers.next(val);
    }

    public eventMarker(): Observable<any> {
        return this._eventMarkers.asObservable();
    }
}
