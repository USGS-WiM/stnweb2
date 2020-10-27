import { Component, OnInit, Input } from '@angular/core';
import { CurrentUserService } from '../services/current-user.service';
// import { FiltersComponent } from '../filters/filters.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import * as L from 'leaflet';
import { EventsService } from '../services/events.service';
import { APP_SETTINGS } from '../app.settings';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    siteid: string;
    panelOpenState = false;
    errorMessage: string;
    map;
    icon;
    isloggedIn = APP_SETTINGS.IS_LOGGEDIN;

    // filtersDialogRef: MatDialogRef<FiltersComponent>;

    currentFilter = sessionStorage.getItem('currentFilter')
        ? JSON.parse(sessionStorage.getItem('currentFiler'))
        : APP_SETTINGS.DEFAULT_FILTER_QUERY;

    // dummy data
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
    dataSource = ELEMENT_DATA;

    // events = [];
    sites = [];
    siteSelected;
    siteClicked = false;
    siteName;

    currentEvent = 7;
    currentEventName = 'FEMA 2013 exercise';
    eventSites: any;

    mapScale;
    latitude;
    longitude;
    zoomLevel;

    riverCondType;

    eventsLoading = false;
    public currentUser;
    markers;

    //eventresults: IceJam[]; // sitevisits
    //events: Events[];

    constructor(
        private eventsService: EventsService,
        public currentUserService: CurrentUserService // private dialog: MatDialog
    ) {
        // this.eventsService.getAllEvents().subscribe((results) => {
        //     this.events = results;
        //     // this.mapResults(this.events);
        // });
        // TODO: by default populate map with most recent event
        // this.eventsService
        //     .getEventSites(this.currentEvent)
        //     .subscribe((results) => {
        //         this.eventSites = results;
        //         this.mapResults(this.eventSites);
        //     });
    }

    ngOnInit() {
        // this.selectedSiteService.currentID.subscribe(siteid => this.siteid = siteid);
        console.log(this.isloggedIn);
        const osm = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution:
                    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.',
            }
        );

        const grayscale = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            }
        );

        const imagery = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution:
                    'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            }
        );

        this.map = new L.Map('map', {
            center: new L.LatLng(39.8283, -98.5795),
            zoom: 4,
            layers: [grayscale],
        });
        /* this.markers = L.featureGroup().addTo(this.map); */

        const baseMaps = {
            'Open Street Map': osm,
            Grayscale: grayscale,
            Imagery: imagery,
        };
        L.control.layers(baseMaps).addTo(this.map);
        L.control.scale({ position: 'bottomright' }).addTo(this.map);

        // begin latLngScale utility logic/////////////////////////////////////////////////////////////////////////////////////////
        // grabbed from FEV
        // displays map scale on map load
        // map.on( 'load', function() {
        this.map.whenReady(() => {
            const mapZoom = this.map.getZoom();
            const tempMapScale = this.scaleLookup(this.map.getZoom());
            this.zoomLevel = mapZoom;
            this.mapScale = tempMapScale;
            const initMapCenter = this.map.getCenter();
            this.latitude = initMapCenter.lat.toFixed(4);
            this.longitude = initMapCenter.lng.toFixed(4);
        });

        // displays map scale on scale change (i.e. zoom level)
        this.map.on('zoomend', () => {
            const mapZoom = this.map.getZoom();
            const mapScale = this.scaleLookup(mapZoom);
            this.mapScale = mapScale;
            this.zoomLevel = mapZoom;
        });

        // updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes 'map center' label
        this.map.on('mousemove', (cursorPosition) => {
            // $('#mapCenterLabel').css('display', 'none');
            if (cursorPosition.latlng !== null) {
                this.latitude = cursorPosition.latlng.lat.toFixed(4);
                this.longitude = cursorPosition.latlng.lng.toFixed(4);
            }
        });
        // updates lat/lng indicator to map center after pan and shows 'map center' label.
        this.map.on('dragend', () => {
            // displays latitude and longitude of map center
            // $('#mapCenterLabel').css('display', 'inline');
            const geographicMapCenter = this.map.getCenter();
            this.latitude = geographicMapCenter.lat.toFixed(4);
            this.longitude = geographicMapCenter.lng.toFixed(4);
        });
        // end latLngScale utility logic/////////
    }
    scaleLookup(mapZoom) {
        switch (mapZoom) {
            case 19:
                return '1,128';
            case 18:
                return '2,256';
            case 17:
                return '4,513';
            case 16:
                return '9,027';
            case 15:
                return '18,055';
            case 14:
                return '36,111';
            case 13:
                return '72,223';
            case 12:
                return '144,447';
            case 11:
                return '288,895';
            case 10:
                return '577,790';
            case 9:
                return '1,155,581';
            case 8:
                return '2,311,162';
            case 7:
                return '4,622,324';
            case 6:
                return '9,244,649';
            case 5:
                return '18,489,298';
            case 4:
                return '36,978,596';
            case 3:
                return '73,957,193';
            case 2:
                return '147,914,387';
            case 1:
                return '295,828,775';
            case 0:
                return '591,657,550';
        }
    }

    // another method to get event sites
    /* getEventSites(arr, arr2) {
    const ret = [];
    for (const i in arr2) {
        if (arr2.indexOf(arr2[i]) > -1) {
            ret.push(arr2[i]);
        }
    }

    this.eventSites = ret;
    console.log(this.eventSites);
    return ret;
  } */

    // openSearchDialog() {
    //     this.filtersDialogRef = this.dialog.open(FiltersComponent, {
    //         minWidth: '60%',
    //         data: {
    //             filters: this.currentFilter,
    //             /* eventID: this.currentEvent,
    //     event_name: this.currentEventName */
    //         },
    //     });
    // }

    mapResults(eventSites: any) {
        // set/reset resultsMarker var to an empty array
        const markers = [];
        const iconClass = ' wmm-icon-diamond wmm-icon-white ';
        const riverConditions = [];

        // tslint:disable-next-line:forin
        // loop through results repsonse from a search query
        if (this.eventSites.length !== undefined) {
            for (const site of this.eventSites) {
                const lat = Number(site.latitude_dd);
                const long = Number(site.longitude_dd);

                const myicon = L.divIcon({
                    className:
                        ' wmm-pin wmm-altblue wmm-icon-circle wmm-icon-white wmm-size-20',
                });

                /* let popupContent = '';

        popupContent = popupContent + '<h3>' + String(eventSites[site]['name']) + '</h3>' +
          '<span class="popupLabel"><b>State</b>:</span> ' + String(eventSites[site]['state']) + '<br/>' +
          '<span class="popupLabel"><b>County</b>:</span> ' + String(eventSites[site]['county']) + '<br/>' +
          '<span class="popupLabel"><b>River</b>:</span> ' + String(eventSites[site]['riverName']) + '<br/>' +
          '<span class="popupLabel"><b>USGSID</b>:</span> ' + String(eventSites[site]['usgsid']);

        const popup = L.popup()
          .setContent(popupContent); */

                L.marker([lat, long], { icon: myicon }).addTo(this.map);
                /* .bindPopup(popup)
          .on('click',
            (data) => {
              this.siteClicked = true;
              this.siteSelected = eventSites[sites]['id'];
              sessionStorage.setItem('selectedSite', JSON.stringify(this.siteSelected));
              this.siteName = eventSites[sites]['name'];
              sessionStorage.setItem('selectedSiteName', JSON.stringify(this.siteName));
              this.eventSites.getAllEvents()
              .subscribe(eventresults => {
                this.eventresults = eventresults;
                console.log(eventresults);
                this.eventSites = eventresults.filter(event => event['siteID'] === this.siteSelected);
                console.log(this.eventSites);
              });
              // this.eventsLoading = false;
            }); */
            }
        }
    }
}
