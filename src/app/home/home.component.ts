import { Component, OnInit, Input } from '@angular/core';
import { CurrentUserService } from '@services/current-user.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialogRef } from '@angular/material/dialog';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormGroupDirective,
    Validators,
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {
    map,
    debounceTime,
    distinctUntilChanged,
    switchMap,
} from 'rxjs/operators';
import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { MAP_CONSTANTS } from './map-constants';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';
import { Event } from '@interfaces/event';
import { EventService } from '@app/services/event.service';
import { Site } from '@interfaces/site';
import { State } from '@interfaces/state';
import { StateService } from '@app/services/state.service';
import { NetworkName } from '@interfaces/network-name';
import { NetworkNameService } from '@app/services/network-name.service';
import { SensorType } from '@interfaces/sensor-type';
import { SensorTypeService } from '@app/services/sensor-type.service';
import { DisplayValuePipe } from '@pipes/display-value.pipe';
import { SitesService } from '@services/sites.service';
import { SiteService } from '@services/site.service';
import 'leaflet.markercluster';
import 'leaflet.markercluster.freezable';
import { FilteredEventsQuery } from '@interfaces/filtered-events-query';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

//leaflet imports for geosearch
import * as esri_geo from 'esri-leaflet-geocoder';

declare let L: any;
import 'leaflet';
import 'leaflet-draw';
import * as esri from 'esri-leaflet';
import { EventTypeService } from '@app/services/event-type.service';
import { EventType } from '@app/interfaces/event-type';
import { Subject } from 'rx';
import { canvas } from 'leaflet';

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

    //for the ALl STN Sites layer
    allSites: Site[];

    public selectedEvent;
    currentEvent: number; //change to subject?
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

    // below is the temp var that holds the all events list for the
    // new method of connecting events with the service. This will eventually replace
    // 'events' once refactored.
    // eventsList: Observable<Event[]>;

    //Create variables for filter dropdowns --start

    // eventTypeControl = new FormControl();
    // // eventTypes: EventType[];
    // eventTypes: Observable<EventType[]>;
    // // filteredEventTypes: Observable<Event[]>;

    // eventStateControl = new FormControl();

    // eventsControl = new FormControl();

    //holds filter values
    events: Event[];

    eventTypes$: Observable<EventType[]>;
    filteredEvents$: Observable<Event[]>; //not used yet
    networks$: Observable<NetworkName[]>;
    sensorTypes$: Observable<SensorType[]>;
    states$: Observable<State[]>;

    //These variables indicate if each layer is checked
    watershedsVisible = false;
    currWarningsVisible = false;
    watchWarnVisible = false;
    ahpsGagesVisible = false;
    allSitesVisible = false;

    //Used for determining when to show layer visibility snack bar message
    currentZoom: number;
    previousZoom: number;

    //for all map layers that aren't basemaps
    supplementaryLayers;

    public mapFilterForm: FormGroup;

    private displayedSites: Subject<Site[]> = new Subject<Site[]>();
    private setDisplayedSites;

    eventIcon = L.divIcon({
        className:
            ' wmm-pin wmm-altblue wmm-icon-circle wmm-icon-white wmm-size-20',
    });

    // TODO:1) populate table of events using pagination. consider the difference between the map and the table.
    //      2) setup a better way to store the state of the data - NgRx.This ought to replace storing it in an object local to this component,
    //       but this local store ok for the short term. The data table should be independent of that data store solution.
    constructor(
        private eventService: EventService,
        private eventTypeService: EventTypeService,
        private stateService: StateService,
        private networkNameService: NetworkNameService,
        private sensorTypeService: SensorTypeService,
        private eventsService: EventService,
        private formBuilder: FormBuilder,
        private networkNamesService: NetworkNameService,
        private sensorTypesService: SensorTypeService,
        public currentUserService: CurrentUserService,
        private sitesService: SitesService,
        private displayValuePipe: DisplayValuePipe,
        public snackBar: MatSnackBar,
        private siteService: SiteService
    ) {
        this.eventTypes$ = this.eventTypeService.eventTypes$;

        this.networks$ = this.networkNameService.networks$;
        this.sensorTypes$ = this.sensorTypeService.sensorTypes$;
        this.states$ = this.stateService.states$;

        this.mapFilterForm = formBuilder.group({
            eventTypeControl: null,
            eventStateControl: '',
            eventsControl: null,
            networkControl: null,
            sensorTypeControl: null,
            stateControl: '',
            surveyedControl: null,
            HWMOnlyControl: false,
            sensorOnlyControl: false,
            surveyedOnlyControl: false,
            bracketSiteOnlyControl: false,
            RDGOnlyControl: false,
            OPDefinedControl: false,
        });
    }

    ngOnInit() {
        /// demonstration code. to be removed
        // let floodEvents: EventType;
        // this.eventTypeService.getEventsByEventType(4).subscribe((eventType) => {
        //     floodEvents = eventType;
        //     console.log('flood events: ' + JSON.parse(eventType));
        // });
        /// end demonstration code

        // this.selectedSiteService.currentID.subscribe(siteid => this.siteid = siteid);
        // console.log('User logged in?: ' + this.isloggedIn);
        this.setCurrentFilter();

        this.eventService.getAllEvents().subscribe((results) => {
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
            // TODO: set up subject to track the next current event and move
            //this.eventSites.next(this.currentEvent)

            /* this.filteredEvents$ = this.eventsControl.valueChanges.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                switchMap((searchTerm) =>
                    APP_UTILITIES.FILTER_EVENT(searchTerm, this.events)
                )
            ); */

            // allow user to type into the event selector to view matching events
            this.filteredEvents$ = this.mapFilterForm
                .get('eventsControl')
                .valueChanges.pipe(
                    map((event_name) =>
                        // match user text input to the index of the corresponding event
                        /* istanbul ignore else */
                        event_name
                            ? APP_UTILITIES.FILTER_EVENT(
                                  event_name,
                                  this.events
                              )
                            : this.events
                    )
                );
            //set up call to get sites for specific event
            this.displaySelectedEvent();
        });
        // get lists of options for dropdowns
        // this.networks$ = this.networkNamesService.getNetworkNames();
        // this.sensorTypes$ = this.sensorTypesService.getSensorTypes();
        this.states$ = this.stateService.getStates();
        // create and configure map
        this.createMap();

        const siteIcon = L.divIcon({
            className: ' allSiteIcon ',
            iconSize: 32,
        });

        //Add all the STN sites to a layer when the map loads
        this.siteService.getAllSites().subscribe((results) => {
            this.allSites = results;
            this.mapResults(
                this.allSites,
                siteIcon,
                this.siteService.siteMarkers
            );
        });
    }

    setCurrentFilter() {
        this.currentFilter = localStorage.getItem('currentFilter')
            ? JSON.parse(localStorage.getItem('currentFilter'))
            : APP_SETTINGS.DEFAULT_FILTER_QUERY;
    }

    // TODO: update this
    updateEventFilter() {
        this.mapFilterForm;
        console.log('this.mapFilterForm', this.mapFilterForm);
        this.eventService
            .filterEvents({
                eventType: this.mapFilterForm.get('eventTypeControl').value
                    ? this.mapFilterForm.get('eventTypeControl').value
                          .event_type_id
                    : null,
                state: this.mapFilterForm.get('eventStateControl').value
                    ? this.mapFilterForm.get('eventStateControl').value
                          .state_abbrev
                    : null,
            })
            .subscribe((filterResponse) => {
                // update events array to the filter response
                this.events = filterResponse;
                // this line necessary to update the list (hack)
                this.mapFilterForm.get('eventsControl').setValue(null);
            });

        // this.events = this.eventService.filterEvents({
        //     eventType: typeArray.toString(),
        //     state: this.eventStateControl.value.state_abbrev,
        // });
    }

    //Temporary message pop up at bottom of screen
    openZoomOutSnackBar(message: string, action: string, duration: number) {
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

        this.sitesService
            .getEventSites(this.currentEvent)
            .subscribe((results) => {
                this.eventSites = results;
                this.mapResults(
                    this.eventSites,
                    this.eventIcon,
                    this.eventMarkers
                );
            });
    }

    createMap() {
        // instantiate leaflet map, with initial center, zoom level, and basemap
        this.map = new L.Map('map', {
            center: MAP_CONSTANTS.defaultCenter,
            zoom: MAP_CONSTANTS.defaultZoom,
            layers: [MAP_CONSTANTS.mapLayers.tileLayers.osm],
            renderer: L.canvas(),
        });

        this.supplementaryLayers = {
            Watersheds: MAP_CONSTANTS.mapLayers.esriDynamicLayers.HUC,
            'All STN Sites': this.siteService.siteMarkers,
            'Current Warnings*':
                MAP_CONSTANTS.mapLayers.esriFeatureLayers.currentWarnings,
            'Watches/Warnings*':
                MAP_CONSTANTS.mapLayers.esriFeatureLayers.watchesWarnings,
            "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>":
                MAP_CONSTANTS.mapLayers.esriFeatureLayers.AHPSGages,
        };

        L.control
            .layers(MAP_CONSTANTS.baseMaps, this.supplementaryLayers, {
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

        // When layer is checked, add layer icon to legend
        /* istanbul ignore next */
        this.map.on('overlayadd', (e) => {
            if (e.name === 'Watersheds') {
                this.watershedsVisible = true;
            }
            if (e.name === 'All STN Sites') {
                this.allSitesVisible = true;
            }
            if (e.name === 'Current Warnings*') {
                this.currWarningsVisible = true;
            }
            if (e.name === 'Watches/Warnings*') {
                this.watchWarnVisible = true;
            }
            if (
                e.name ===
                "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>"
            ) {
                this.ahpsGagesVisible = true;
            }
        });
        // When layer is unchecked, remove layer icon from legend
        /* istanbul ignore next */
        this.map.on('overlayremove', (e) => {
            console.log('this is e remove', e);
            if (e.name === 'Watersheds') {
                this.watershedsVisible = false;
            }
            if (e.name === 'All STN Sites') {
                this.allSitesVisible = false;
            }
            if (e.name === 'Current Warnings*') {
                this.currWarningsVisible = false;
            }
            if (e.name === 'Watches/Warnings*') {
                this.watchWarnVisible = false;
            }
            if (
                e.name ===
                "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>"
            ) {
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
            //Disable clustering for the All STN Sites layer when zoom >= 12 so we can see individual sites
            if (this.currentZoom >= 12) {
                this.siteService.siteMarkers.disableClustering();
            }
            if (this.currentZoom < 12) {
                this.siteService.siteMarkers.enableClustering();
            }
            //If the zoom went from 9 to 8 and the gages/watches/warnings are on,
            //that layer is checked, but it's not displayed
            //warn users of that in a snack bar message
            if (
                this.ahpsGagesVisible == true ||
                this.currWarningsVisible == true ||
                this.watchWarnVisible == true
            ) {
                if (this.previousZoom == 9 && this.currentZoom == 8) {
                    this.openZoomOutSnackBar(
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

        // When layer is checked, add layer icon to legend
        /* istanbul ignore next */
        this.map.on('overlayadd', (e) => {
            if (e.name === 'Watersheds') {
                this.watershedsVisible = true;
            }
            if (e.name === 'All STN Sites') {
                this.allSitesVisible = true;
            }
            if (e.name === 'Current Warnings*') {
                this.currWarningsVisible = true;
            }
            if (e.name === 'Watches/Warnings*') {
                this.watchWarnVisible = true;
            }
            if (
                e.name ===
                "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>"
            ) {
                this.ahpsGagesVisible = true;
            }
        });
        // When layer is unchecked, remove layer icon from legend
        /* istanbul ignore next */
        this.map.on('overlayremove', (e) => {
            console.log('this is e remove', e);
            if (e.name === 'Watersheds') {
                this.watershedsVisible = false;
            }
            if (e.name === 'All STN Sites') {
                this.allSitesVisible = false;
            }
            if (e.name === 'Current Warnings*') {
                this.currWarningsVisible = false;
            }
            if (e.name === 'Watches/Warnings*') {
                this.watchWarnVisible = false;
            }
            if (
                e.name ===
                "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>"
            ) {
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

    /* istanbul ignore next */
    mapResults(eventSites: any, myIcon: any, layerType: any) {
        // set/reset resultsMarker var to an empty array
        const markers = [];
        const iconClass = ' wmm-icon-diamond wmm-icon-white ';
        const riverConditions = [];

        // loop through results responsefrom a search query
        if (eventSites.length !== undefined) {
            for (const site of eventSites) {
                const lat = Number(site.latitude_dd);
                const long = Number(site.longitude_dd);

                /* let popupContent = '';

        popupContent = popupContent + '<h3>' + String(eventSites[site]['name']) + '</h3>' +
          '<span class="popupLabel"><b>State</b>:</span> ' + String(eventSites[site]['state']) + '<br/>' +
          '<span class="popupLabel"><b>County</b>:</span> ' + String(eventSites[site]['county']) + '<br/>' +
          '<span class="popupLabel"><b>River</b>:</span> ' + String(eventSites[site]['riverName']) + '<br/>' +
          '<span class="popupLabel"><b>USGSID</b>:</span> ' + String(eventSites[site]['usgsid']);

        const popup = L.popup()
          .setContent(popupContent); */
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
                        L.marker([lat, long], { icon: myIcon }).addTo(
                            layerType
                        );
                    }
                    //Make circle markers for the All STN Sites layer
                    if (layerType == this.siteService.siteMarkers) {
                        L.marker([lat, long], {
                            icon: myIcon,
                            iconSize: 32,
                        }).addTo(layerType);
                    }
                }

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

            // myMarkers.addTo(this.map);
        }

        if (layerType == this.eventMarkers) {
            this.eventMarkers.addTo(this.map);
        }
    }

    public clearMapFilterForm(): void {
        // this works but will not fully clear mat-selects if they're open when the box is clicked
        this.mapFilterForm.reset();
    }

    public submitMapFilter() {
        let filterParams = JSON.parse(JSON.stringify(this.mapFilterForm.value));
        console.log('filterParams', filterParams);

        //collect and format selected Filter Form values
        let eventId = filterParams.eventsControl
            ? filterParams.eventsControl.event_id
            : '';
        let networkIds = filterParams.networkControl
            ? filterParams.networkControl.toString()
            : '';
        let sensorIds = filterParams.sensorTypeControl
            ? filterParams.sensorTypeControl.toString()
            : '';
        let stateAbbrevs = filterParams.stateControl
            ? filterParams.stateControl.toString()
            : '';
        //surveyed = true, unsurveyed = false, or leave empty
        let surveyed = filterParams.surveyedControl
            ? filterParams.surveyedControl
            : '';
        let HWMTrue = filterParams.HWMOnlyControl ? '1' : '';
        let sensorTrue = filterParams.sensorOnlyControl ? '1' : '';
        //Pre-deployed bracket site is HousingTypeOne=1 in API
        let bracketTrue = filterParams.bracketSiteOnlyControl ? '1' : '';
        let RDGTrue = filterParams.RDGOnlyControl ? '1' : '';
        let opDefinedTrue = filterParams.OPDefinedControl ? '1' : '';

        // format url params into single string
        let urlParamString =
            'Event=' +
            eventId +
            '&State=' +
            stateAbbrevs +
            '&SensorType=' +
            sensorIds +
            '&NetworkName=' +
            networkIds +
            '&OPDefined=' +
            opDefinedTrue +
            '&HWMOnly=' +
            HWMTrue +
            '&HWMSurveyed=' +
            surveyed +
            '&SensorOnly=' +
            sensorTrue +
            '&RDGOnly=' +
            RDGTrue +
            '&HousingTypeOne=' +
            bracketTrue;

        this.sitesService.getFilteredSites(urlParamString).subscribe((res) => {
            this.mapResults(res, this.eventIcon, this.eventMarkers);
        });

        return urlParamString;
    }
}
