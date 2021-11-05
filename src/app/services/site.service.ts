import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { EMPTY, Subject } from 'rxjs';
import { Site } from '@interfaces/site';

declare let L: any;
import 'leaflet';

@Injectable({
    providedIn: 'root',
})
export class SiteService {
    // public currentEvent;
    private event = new BehaviorSubject<number>(0);
    currentEvent = this.event.asObservable();

    constructor(private httpClient: HttpClient) {
    }

    //private eventSitesSubject: Subject<any>;
    // public get eventSites(): Observable<any> {
    //     return this.eventSitesSubject.asObservable();
    // }

    // Event Sites
    public getEventSites(eventID: number): Observable<Site[]> {
        return this.httpClient
            .get(APP_SETTINGS.EVENTS + '/' + eventID + '/Sites.json')
            .pipe(
                tap((response) => {
                    return response;
                }),
                catchError(this.handleError<any>('getEventSites', []))
            );
    }

    // Filtered Sites
    public getFilteredSites(urlParams: string): Observable<Site[]> {
        console.log('URL Parameters passed: ' + urlParams);
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/FilteredSites.json?' + urlParams)
            .pipe(
                tap((response) => {
                    console.log(
                        'getFilteredSites response received' //: ' +
                        // JSON.stringify(response)
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getFilteredSites', []))
            );
    }

    // All Sites
    public getAllSites(): Observable<any> {
        return this.httpClient.get(APP_SETTINGS.SITES_URL + '.json').pipe(
            tap((response) => {
                console.log('Site list response received ' /*+ response*/);
                return response;
            }),
            catchError(this.handleError<any>('getAllSites', []))
        );
    }

    //Get single site by ID
    public getSingleSite(siteID: string): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getSingleSite response received' //: ' +
                        // JSON.stringify(response)
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSingleSite', []))
            );
    }

    //Get housing for a single site
    public getSiteHousing(siteID: string): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/siteHousings.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getSiteHousing response received' //: ' +
                        // JSON.stringify(response)
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSiteHousing', []))
            );
    }

    //Get horizontal datum lookup
    public getHDatum(): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/HorizontalDatums.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHDatum response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHDatum', []))
            );
    }

    //Get horizontal collection method lookup
    public getHCollectionMethod(): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/HorizontalMethods.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHCollectionMethod response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHCollectionMethod', []))
            );
    }

    //Get vertical datum by datum id
    public getVDatum(vDatumID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/VerticalDatums/'+ vDatumID + '.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getDatum response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getVDatum', []))
            );
    }

    //Get vertical collection method by id
    public getVCollectionMethod(vMethodID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/VerticalMethods/' + vMethodID + '.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getVCollectionMethod response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getVCollectionMethod', []))
            );
    }

    //Get housing type
    public getHousingType(housing_type_id): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/HousingTypes/' + housing_type_id + '.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHousingType response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHousingType', []))
            );
    }

    //Get network type
    public getNetworkType(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/NetworkTypes.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getNetworkType response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getNetworkType', []))
            );
    }

    //Get network name
    public getNetworkName(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/NetworkNames.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getNetworkName response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getNetworkName', []))
            );
    }

    //Get landowner contact
    public getLandownerContact(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/LandOwner.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getLandownerContact response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getLandownerContact', []))
            );
    }

    //Get member name
    public getMemberName(member_id): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/Members/' + member_id + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getMemberName response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getMemberName', []))
            );
    }

    //Get site events
    public getSiteEvents(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + 'Events.json?Site=' + siteID, {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getSiteEvents response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSiteEvents', []))
            );
    }

    //Get site events
    public getSensorEvents(sensorID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + 'Instruments/' + sensorID + '/Event.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getSensorEvents response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSensorEvents', []))
            );
    }

    //Get site events
    public getHWMEvents(hwmID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + 'HWMs/' + hwmID + '/Event.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getHWMEvents response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHWMEvents', []))
            );
    }

    // Get sensor status types
    public getStatusTypes(): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + 'StatusTypes.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getStatusTypes response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getStatusTypes', []))
            );
    }

    // Get sensor status
    public getStatus(sensorID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/Instruments/' + sensorID + '/InstrumentStatus.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getStatus response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getStatus', []))
            );
    }

    //Get Objective Points
    public getObjectivePoints(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/ObjectivePoints.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getObjectivePoints response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getObjectivePoints', []))
            );
    }

    // Get OP information
    public getOPInfo(opID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + 'ObjectivePoints/' + opID + '.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getOPInfo response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getOPInfo', []))
            );
    }

    //Get OP Type
    public getOPType(opTypeID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/OPTypes/' + opTypeID + '.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getOPType response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getOPType', []))
            );
    }

    //Get OP Quality
    public getOPQuality(opQualityID): Observable<any> {
    return this.httpClient
        .get(APP_SETTINGS.API_ROOT + '/ObjectivePointQualities/' + opQualityID + '.json')
        .pipe(
            tap((response) => {
                console.log(
                    'getOPQuality response received'
                );
                return response;
            }),
            catchError(this.handleError<any>('getOPQuality', []))
        );
    }

    //Get Site Sensors
    public getSiteFullInstruments(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/SiteFullInstrumentList.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getSiteFullInstruments response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSiteFullInstruments', []))
            );
    }

    //Get Site Event Sensors
    public getSiteEventInstruments(siteID, eventID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/Instruments.json?Event=' + eventID)
            .pipe(
                tap((response) => {
                    console.log(
                        'getSiteEventInstruments response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSiteEventInstruments', []))
            );
    }

    //Get deployment types
    public getDeploymentTypes(): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/DeploymentTypes.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getDeploymentTypes response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getDeploymentTypes', []))
            );
    }

    //Get HWMs
    public getHWM(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/HWMs.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHWM response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHWM', []))
            );
    }

    //Get Event HWMs
    public getEventHWM(siteID, eventID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/EventHWMs.json?Event=' + eventID)
            .pipe(
                tap((response) => {
                    console.log(
                        'getEventHWM response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getEventHWM', []))
            );
    }


    //Get Site Files
    public getSiteFiles(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/Files.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getSiteFiles response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSiteFiles', []))
            );
    }

    //Get Site Event Files
    public getSiteEventFiles(siteID, eventID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/Files.json?Site=' + siteID + '&Event=' + eventID)
            .pipe(
                tap((response) => {
                    console.log(
                        'getSiteEventFiles response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSiteEventFiles', []))
            );
    }

    //Get File Sensors
    public getFileSensor(fileID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/Files/' + fileID + '/Instrument.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getFileSensor response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getFileSensor', []))
            );
    }

    // Get Datum Location Files
    public getDatumLocFiles(datumLocID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/ObjectivePoints/' + datumLocID + '/Files.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getDatumLocFiles response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getDatumLocFiles', []))
            );
    }

    //Get Sensor Files
    public getSensorFiles(SensorID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/Instruments/' + SensorID + '/Files.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getSensorFiles response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSensorFiles', []))
            );
    }

    //Get HWM Files
    public getHWMFiles(hwmID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/HWMs/' + hwmID + '/Files.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHWMFiles response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHWMFiles', []))
            );
    }

    //Get Peaks
    public getPeakSummaryView(siteID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.SITES_URL + '/' + siteID + '/PeakSummaryView.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getPeakSummaryView response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getPeakSummaryView', []))
            );
    }

    //Get OP Measurements
    public getOPMeasurements(instrumentStatusID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/InstrumentStatus/' + instrumentStatusID + '/OPMeasurements.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getOPMeasurements response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getOPMeasurements', []))
            );
    }

    //Get HWM Type
    public getHWMType(hwmID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/HWMs/' + hwmID + '/Type.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHWMType response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHWMType', []))
            );
    }

    //Get HWM Marker
    public getHWMMarker(hwmID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/HWMs/' + hwmID + '/Marker.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHWMMarker response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHWMMarker', []))
            );
    }

    //Get HWM Quality
    public getHWMQuality(hwmID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/HWMs/' + hwmID + '/Quality.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getHWMQuality response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getHWMQuality', []))
            );
    }

    //Get File Type
    public getFileType(fileTypeID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/FileTypes/' + fileTypeID + '.json')
            .pipe(
                tap((response) => {
                    console.log(
                        'getFileType response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getFileType', []))
            );
    }

    //Get File Source
    public getFileSource(sourceID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/Sources/' + sourceID + '/Agencies.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getFileSource response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getFileSource', []))
            );
    }

    //Get File Source
    public getSourceName(sourceID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + '/Sources/' + sourceID + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getSourceName response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSourceName', []))
            );
    }

    //Get Data File Approval
    public getApproval(dataFileID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + 'DataFiles/' + dataFileID + '/Approval.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getSourceName response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getSourceName', []))
            );
    }

    //Get Data File Details
    public getDataFile(dataFileID): Observable<any> {
        return this.httpClient
            .get(APP_SETTINGS.API_ROOT + 'DataFiles/' + dataFileID + '.json', {
                headers: APP_SETTINGS.AUTH_JSON_HEADERS,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'getDataFile response received'
                    );
                    return response;
                }),
                catchError(this.handleError<any>('getDataFile', []))
            );
    }

    public setCurrentEvent(currentEvent: number) {
        this.event.next(currentEvent);
    }  
    
    //Get site events
    public getCurrentEvent(): Observable<any> {
        return this.currentEvent
            .pipe(
                tap((response) => {
                    return response;
                }),
                catchError(this.handleError<any>('getCurrentEvent', []))
            );
    }

    // Markers for All Sites Layers
    public allSiteMarkers = new L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 40,
        iconCreateFunction: function (cluster) {
            var markers = cluster.getAllChildMarkers();
            var html =
                '<div style="text-align: center; margin-top: 7px; color: white">' +
                markers.length +
                '</div>';
            return L.divIcon({
                html: html,
                className: 'allSiteIcon',
                iconSize: L.point(32, 32),
            });
        },
        // spiderfyDistanceMultiplier: 2,
    });

    public manyFilteredSitesMarkers = new L.markerClusterGroup([]);

    public siteMarkers = new L.featureGroup([]);

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
