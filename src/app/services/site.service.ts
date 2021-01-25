import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
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
    constructor(private httpClient: HttpClient) {}

    //private eventSitesSubject: Subject<any>;
    // public get eventSites(): Observable<any> {
    //     return this.eventSitesSubject.asObservable();
    // }

    //get sites for a selected event
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

    public getAllSites(): Observable<any> {
        return this.httpClient.get(APP_SETTINGS.SITES_URL + '.json').pipe(
            tap((response) => {
                console.log('Site list response received ' /*+ response*/);
                return response;
            }),
            catchError(this.handleError<any>('getAllSites', []))
        );
    }

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

    public manyFilteredSitesMarkers = new L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 25,
        iconCreateFunction: function (cluster) {
            var markers = cluster.getAllChildMarkers();
            var html =
                '<div style="text-align: center; margin-top: 7px; color: white">' +
                markers.length +
                '</div>';
            return L.divIcon({
                html: html,
                className: 'manyFilteredSitesIcon',
                iconSize: L.point(32, 32),
            });
        },
    });

    public siteMarkers = new L.featureGroup([]);

    private _allallSiteMarkers: Subject<any> = new Subject<any>();
    public setAllallSiteMarkers(val: any) {
        this.allSiteMarkers = val;
        this._allallSiteMarkers.next(val);
    }
    public allSiteMarker(): Observable<any> {
        return this._allallSiteMarkers.asObservable();
    }

    private _manyFilteredSiteMarkers: Subject<any> = new Subject<any>();
    public setManyFilteredSiteMarkers(val: any) {
        this.manyFilteredSitesMarkers = val;
        this._manyFilteredSiteMarkers.next(val);
    }
    public manyFilteredSiteMarker(): Observable<any> {
        return this._manyFilteredSiteMarkers.asObservable();
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
