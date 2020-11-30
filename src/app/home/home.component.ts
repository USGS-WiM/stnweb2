import { Component, OnInit, Input } from '@angular/core';
import { CurrentUserService } from '@services/current-user.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { MAP_CONSTANTS } from './map-constants';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';
import { Event } from '@interfaces/event';
import { EventsService } from '@services/events.service';
import { State } from '@interfaces/state';
import { StatesService } from '@services/states.service';
import { NetworkName } from '@interfaces/network-name';
import { NetworkNamesService } from '@services/network-names.service';
import { SensorType } from '@interfaces/sensor-type';
import { SensorTypesService } from '@services/sensor-types.service';
import { DisplayValuePipe } from '@pipes/display-value.pipe';
import { SitesService } from '@services/sites.service';

//leaflet imports for geosearch
import * as esri_geo from 'esri-leaflet-geocoder';

declare let L: any;
import 'leaflet';
import 'leaflet-draw';
import * as esri from 'esri-leaflet';

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
    currentFilter;

    drawControl;
    drawnItems;

    // dummy data
    displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
    dataSource = ELEMENT_DATA;

    // events = [];
    sites = [];
    siteSelected;
    siteClicked = false;
    siteName;

    public selectedEvent;
    currentEvent: number;
    currentEventName: string;
    eventSites: any;
    eventMarkers = L.layerGroup([]);

    mapScale;
    latitude;
    longitude;
    zoomLevel;

    eventsLoading = false;
    public currentUser;
    markers;

    //Create variables for filter dropdowns --start
    eventsControl = new FormControl();
    events: Event[];
    filteredEvents: Observable<Event[]>;

    networkControl = new FormControl();
    networks: NetworkName[];

    sensorControl = new FormControl();
    sensors: SensorType[];

    stateControl = new FormControl();
    states: State[];
    //Create variables for filter dropdowns --end

    //These variables indicate if each layer is checked
    watershedsVisible = false;
    currWarningsVisible = false;
    watchWarnVisible = false;
    ahpsGagesVisible = false;

    //Used for determining when to show layer visibility snack bar message
    currentZoom: number;
    previousZoom: number;

    // TODO:1) populate table of events using pagination. consider the difference between the map and the table.
    //      2) setup a better way to store the state of the data - NgRx.This ought to replace storing it in an object local to this component,
    //       but this local store ok for the short term. The data table should be independent of that data store solution.
    constructor(
        private eventsService: EventsService,
        private statesService: StatesService,
        private networkNamesService: NetworkNamesService,
        private sensorTypesService: SensorTypesService,
        public currentUserService: CurrentUserService,
        private sitesService: SitesService,
        private displayValuePipe: DisplayValuePipe,
        public snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        // this.selectedSiteService.currentID.subscribe(siteid => this.siteid = siteid);
        console.log('User logged in?: ' + this.isloggedIn);
        this.setCurrentFilter();

        this.eventsService.getAllEvents().subscribe((results) => {
            this.events = results;
            //sort the events by date, most recent at the top of the list
            this.events = APP_UTILITIES.SORT(
                this.events,
                'event_start_date',
                'descend'
            );

            //Get id and name of most recent event
            this.currentEvent = this.events[0].event_id;
            this.currentEventName = this.events[0].event_name;

            // allow user to type into the event selector to view matching events
            this.filteredEvents = this.eventsControl.valueChanges.pipe(
                startWith(''),
                map((value) =>
                    typeof value === 'string' ? value : value.event_name
                ),
                map((event_name) =>
                    // match user text input to the index of the corresponding event
                    /* istanbul ignore else */
                    event_name
                        ? APP_UTILITIES.FILTER_EVENT(event_name, this.events)
                        : this.events
                )
            );

            // create and configure map
            this.createMap();

            // this.mapResults(this.events);

            // by default populate map with most recent event
            this.sitesService
                .getEventSites(this.currentEvent)
                .subscribe((results) => {
                    this.eventSites = results;
                    this.mapResults(this.eventSites);
                });
        });

        this.networkNamesService.getNetworkNames().subscribe((results) => {
            this.networks = results;
        });
        this.sensorTypesService.getSensorTypes().subscribe((results) => {
            this.sensors = results;
        });
        this.statesService.getStates().subscribe((results) => {
            this.states = results;
        });
    }

    setCurrentFilter() {
        this.currentFilter = localStorage.getItem('currentFilter')
            ? JSON.parse(localStorage.getItem('currentFilter'))
            : APP_SETTINGS.DEFAULT_FILTER_QUERY;
    }

    //Temporary message pop up at bottom of screen
    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, {
            duration: duration,
        });
    }
    //TODO: LOOK HERE FIRST
    displaySelectedEvent() {
        //Clear the old event markers from the map
        if (this.eventMarkers !== undefined) {
            this.eventMarkers.removeFrom(this.map);
        }
        //Clear the old markers from the layer
        this.eventMarkers = L.layerGroup([]);
        //Plot markers for selected event
        if (this.selectedEvent !== undefined) {
            this.sitesService
                .getEventSites(this.selectedEvent.event_id)
                .subscribe((results) => {
                    this.eventSites = results;
                    this.mapResults(this.eventSites);
                });
        }
    }

    createMap() {
        // instantiate leaflet map, with initial center, zoom level, and basemap
        this.map = new L.Map('map', {
            center: MAP_CONSTANTS.defaultCenter,
            zoom: MAP_CONSTANTS.defaultZoom,
            layers: [MAP_CONSTANTS.mapLayers.tileLayers.osm],
        });
        /* this.markers = L.featureGroup().addTo(this.map); */

        L.control
            .layers(MAP_CONSTANTS.baseMaps, MAP_CONSTANTS.supplementaryLayers, {
                position: 'topleft',
            })
            .addTo(this.map);
        L.control.scale({ position: 'bottomright' }).addTo(this.map);

        // begin latLngScale utility logic/////////////////////////////////////////////////////////////////////////////////////////
        // grabbed from FEV
        // displays map scale on map load
        // map.on( 'load', function() {
        this.map.whenReady(() => {
            const mapZoom = this.map.getZoom();
            const tempMapScale = APP_UTILITIES.SCALE_LOOKUP(this.map.getZoom());
            this.zoomLevel = mapZoom;
            this.mapScale = tempMapScale;
            const initMapCenter = this.map.getCenter();
            this.latitude = initMapCenter.lat.toFixed(4);
            this.longitude = initMapCenter.lng.toFixed(4);
        });

        // displays map scale on scale change (i.e. zoom level)
        /* istanbul ignore next */
        this.map.on('zoomend', () => {
            const mapZoom = this.map.getZoom();
            const mapScale = APP_UTILITIES.SCALE_LOOKUP(mapZoom);
            this.mapScale = mapScale;
            this.zoomLevel = mapZoom;
        });

        // updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes 'map center' label
        /* istanbul ignore next */
        this.map.on('mousemove', (cursorPosition) => {
            // $('#mapCenterLabel').css('display', 'none');
            if (cursorPosition.latlng !== null) {
                this.latitude = cursorPosition.latlng.lat.toFixed(4);
                this.longitude = cursorPosition.latlng.lng.toFixed(4);
            }
        });
        // updates lat/lng indicator to map center after pan and shows 'map center' label.
        /* istanbul ignore next */
        this.map.on('dragend', () => {
            // displays latitude and longitude of map center
            // $('#mapCenterLabel').css('display', 'inline');
            const geographicMapCenter = this.map.getCenter();
            this.latitude = geographicMapCenter.lat.toFixed(4);
            this.longitude = geographicMapCenter.lng.toFixed(4);
        });
        // end latLngScale utility logic/////////

        const searchControl = new esri_geo.geosearch().addTo(this.map);

        //This layer will contain the location markers
        const results = new L.LayerGroup().addTo(this.map);

        //Clear the previous search marker and add a marker at the new location
        /* istanbul ignore next */
        searchControl.on('results', function (data) {
            results.clearLayers();
            for (let i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));
            }
        });

        //When the watershed checkbox is checked, add watershed icon to legend
        this.map.on('overlayadd', (e) => {
            if (e.name === 'Watersheds') {
                this.watershedsVisible = true;
            }
            if (e.name === 'Current Warnings') {
                this.currWarningsVisible = true;
            }
            if (e.name === 'Watches/Warnings') {
                this.watchWarnVisible = true;
            }
            if (e.name === 'AHPS Gages') {
                this.ahpsGagesVisible = true;
            }
        });
        //When the watershed checkbox is unchecked, remove watershed icon from legend
        this.map.on('overlayremove', (e) => {
            if (e.name === 'Watersheds') {
                this.watershedsVisible = false;
            }
            if (e.name === 'Current Warnings') {
                this.currWarningsVisible = false;
            }
            if (e.name === 'Watches/Warnings') {
                this.watchWarnVisible = false;
            }
            if (e.name === 'AHPS Gages') {
                this.ahpsGagesVisible = false;
            }
        });

        //Get the value of the previous zoom
        this.map.on('zoomstart', () => {
            this.previousZoom = this.map.getZoom();
        });
        //Get the value of the current zoom
        this.map.on('zoomend', () => {
            this.currentZoom = this.map.getZoom();
            //If the zoom went from 9 to 8 and the gages/watches/warnings are on,
            //that layer is checked, but it's not displayed
            //warn users of that in a snack bar message
            if (
                this.ahpsGagesVisible == true ||
                this.currWarningsVisible == true ||
                this.watchWarnVisible == true
            ) {
                if (this.previousZoom == 9 && this.currentZoom == 8) {
                    this.openSnackBar(
                        'Zoom to level 9 or higher to view additional layers',
                        'OK',
                        4000
                    );
                }
            }
        });

        this.createDrawControls();
    }

    // For drawn items: generate popup content based on layer type
    // Returns HTML string, or null if unknown object
    getDrawnItemPopupContent(layer) {
        if (layer instanceof L.Polygon) {
            /* istanbul ignore next */
            const latlngs = layer._defaultShape
                    ? layer._defaultShape()
                    : layer.getLatLngs(),
                area = L.GeometryUtil.geodesicArea(latlngs);
            return 'Area: ' + L.GeometryUtil.readableArea(area);
            // Polyline - distance
        } else if (layer instanceof L.Polyline) {
            /* istanbul ignore next */
            const latlngs = layer._defaultShape
                ? layer._defaultShape()
                : layer.getLatLngs();
            let distance = 0;
            if (latlngs.length < 2) {
                return 'Distance: N/A';
            } else {
                for (let i = 0; i < latlngs.length - 1; i++) {
                    distance += latlngs[i].distanceTo(latlngs[i + 1]);
                }
                distance = distance * 0.000621371;
                return 'Distance: ' + APP_UTILITIES.ROUND(distance, 2) + ' mi';
            }
        } else {
            return null;
        }
    }

    // createDrawnItem(event) {
    //     const layer = event.layer;
    //     const content = this.getDrawnItemPopupContent(layer);
    //     if (content !== null) {
    //         layer.bindPopup(content);
    //     }
    //     this.drawnItems.addLayer(layer);
    // }

    // editDrawnItem(event) {
    //     const layers = event.layers;
    //     layers.eachLayer(function (layer) {
    //         const content = this.getDrawnItemPopupContent(layer);
    //         if (content !== null) {
    //             layer.setPopupContent(content);
    //         }
    //     });
    // }

    createDrawControls() {
        this.drawnItems = L.featureGroup().addTo(this.map);
        // User can select from drawing a line or polygon; other options are disabled
        // Measurements are in miles
        this.drawControl = new L.Control.Draw({
            edit: {
                featureGroup: this.drawnItems,
                poly: {
                    allowIntersection: false,
                },
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    metric: false,
                },
                marker: false,
                circle: false,
                circlemarker: false,
                rectangle: false,
                polyline: {
                    metric: false,
                    feet: false,
                },
            },
        });

        //Add the buttons to the map
        this.map.addControl(this.drawControl);

        // Generate popup content based on layer type
        // - Returns HTML string, or null if unknown object
        /* istanbul ignore next */
        const getPopupContent = (layer) => {
            return this.getDrawnItemPopupContent(layer);
        };

        // // Object created - bind popup to layer, add to feature group
        // const create = (event) => {
        //     return this.createDrawnItem(event);
        // };

        // // Object(s) edited - update popups
        // const edit = (event) => {
        //     return this.editDrawnItem(event);
        // };

        // this.map.on(L.Draw.Event.CREATED, (event) => {
        //     create(event);
        // });

        // this.map.on(L.Draw.Event.EDITED, (event) => {
        //     edit(event);
        // });

        // Object created - bind popup to layer, add to feature group
        /* istanbul ignore next */
        this.map.on(L.Draw.Event.CREATED, function (event) {
            const layer = event.layer;
            const content = getPopupContent(layer);
            if (content !== null) {
                layer.bindPopup(content);
            }
            this.drawnItems.addLayer(layer);
        });

        // Object(s) edited - update popups
        /* istanbul ignore next */
        this.map.on(L.Draw.Event.EDITED, function (event) {
            const layers = event.layers;
            // const content = null;
            layers.eachLayer(function (layer) {
                const content = getPopupContent(layer);
                if (content !== null) {
                    layer.setPopupContent(content);
                }
            });
        });

        //When the watershed checkbox is checked, add watershed icon to legend
        /* istanbul ignore next */
        this.map.on('overlayadd', (e) => {
            if (e.name === 'Watersheds') {
                this.watershedsVisible = true;
            }
            if (e.name === 'Current Warnings') {
                this.currWarningsVisible = true;
            }
            if (e.name === 'Watches/Warnings') {
                this.watchWarnVisible = true;
            }
            if (e.name === 'AHPS Gages') {
                this.ahpsGagesVisible = true;
            }
        });
        //When the watershed checkbox is unchecked, remove watershed icon from legend
        /* istanbul ignore next */
        this.map.on('overlayremove', (e) => {
            if (e.name === 'Watersheds') {
                this.watershedsVisible = false;
            }
            if (e.name === 'Current Warnings') {
                this.currWarningsVisible = false;
            }
            if (e.name === 'Watches/Warnings') {
                this.watchWarnVisible = false;
            }
            if (e.name === 'AHPS Gages') {
                this.ahpsGagesVisible = false;
            }
        });
    }

    // When button is clicked, focus center and zoom to the selected event
    // As a placeholder, currently returns to defaults
    // TODO: work with extent for event
    eventFocus() {
        this.map.setView(
            MAP_CONSTANTS.defaultCenter,
            MAP_CONSTANTS.defaultZoom
        );
    }

    // options to be displayed when selecting event filter
    displayEvent(event: Event): string {
        return event && event.event_name ? event.event_name : '';
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

    /* istanbul ignore next */
    mapResults(eventSites: any) {
        // set/reset resultsMarker var to an empty array
        const markers = [];
        const iconClass = ' wmm-icon-diamond wmm-icon-white ';
        const riverConditions = [];

        // loop through results responsefrom a search query
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
                /* istanbul ignore next */
                L.marker([lat, long], { icon: myicon }).addTo(this.map);
                /* .bindPopup(popup)
          .on('click',
            (data) => {
              this.siteClicked = true;
              this.siteSelected = eventSites[sites]['id'];
              localStorage.setItem('selectedSite', JSON.stringify(this.siteSelected));
              this.siteName = eventSites[sites]['name'];
              localStorage.setItem('selectedSiteName', JSON.stringify(this.siteName));
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

            //add event markers to map
            this.eventMarkers.addTo(this.map);
        }
    }
}
