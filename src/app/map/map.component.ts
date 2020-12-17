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

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
    siteid: string;
    panelOpenState = false;
    errorMessage: string;
    map;
    icon;
    isloggedIn = APP_SETTINGS.IS_LOGGEDIN;
    currentFilter;

    drawControl;
    drawnItems;

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
    eventMarkers = L.featureGroup([]);

    mapScale;
    latitude;
    longitude;
    zoomLevel;

    eventsLoading = false;
    public currentUser;
    markers;

    //Begin with the map and filters panels expanded
    mapPanelState: boolean = true;
    filtersPanelState: boolean = true;

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
    states: State[];
    eventStates: State[];
    selectedStates: State[] = new Array<State>();
    stateList = '';
    setStateAbbrev = '';

    eventTypes$: Observable<EventType[]>;
    filteredEvents$: Observable<Event[]>; //not used yet
    networks$: Observable<NetworkName[]>;
    sensorTypes$: Observable<SensorType[]>;
    eventStates$: Observable<State[]>;
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

    //for sites displayed on map load and when running queries
    eventIcon = L.divIcon({
        className:
            ' wmm-pin wmm-altblue wmm-icon-circle wmm-icon-white wmm-size-20',
    });
    //for the All STN Sites layer
    siteIcon = L.divIcon({
        className: ' allSiteIcon ',
        iconSize: 32,
    });

    // TODO:1) populate table of events using pagination. consider the difference between the map and the table.
    //      2) setup a better way to store the state of the data - NgRx.This ought to replace storing it in an object local to this component,
    //       but this local store ok for the short term. The data table should be independent of that data store solution.
    constructor(
        public eventService: EventService,
        private eventTypeService: EventTypeService,
        public stateService: StateService,
        private networkNameService: NetworkNameService,
        private sensorTypeService: SensorTypeService,
        private eventsService: EventService,
        private formBuilder: FormBuilder,
        private networkNamesService: NetworkNameService,
        private sensorTypesService: SensorTypeService,
        public currentUserService: CurrentUserService,
        public siteService: SiteService,
        private displayValuePipe: DisplayValuePipe,
        public snackBar: MatSnackBar
    ) {
        this.eventTypes$ = this.eventTypeService.eventTypes$;

        this.networks$ = this.networkNameService.networks$;
        this.sensorTypes$ = this.sensorTypeService.sensorTypes$;
        this.eventStates$ = this.stateService.eventStates$;
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
        //subscribe to services to get data
        this.getData();
        this.setCurrentFilter();
        // create and configure map
        this.createMap();
    }

    setCurrentFilter() {
        this.currentFilter = localStorage.getItem('currentFilter')
            ? JSON.parse(localStorage.getItem('currentFilter'))
            : APP_SETTINGS.DEFAULT_FILTER_QUERY;
    }

    getData() {
        //Get all events, populate the event filter, get most recent event
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

            // allow user to type into the event selector to view matching events
            this.filteredEvents$ = this.mapFilterForm
                .get('eventsControl')
                .valueChanges.pipe(
                    debounceTime(200),
                    distinctUntilChanged(),
                    /* istanbul ignore else */
                    map((searchTerm) =>
                        searchTerm
                            ? APP_UTILITIES.FILTER_EVENT(
                                  searchTerm,
                                  this.events
                              )
                            : this.events
                    )
                );
            //set up call to get sites for specific event
            this.displaySelectedEvent();
        });
        //Add all the STN sites to a layer when the map loads
        this.siteService.getAllSites().subscribe((results) => {
            this.allSites = results;
            this.mapResults(
                this.allSites,
                this.siteIcon,
                this.siteService.siteMarkers,
                false
            );
        });
        //Get states to fill state filters
        this.stateService.getStates().subscribe((results) => {
            this.eventStates = results;
            this.states = results;
            this.eventStates$ = this.mapFilterForm
                .get('eventStateControl')
                .valueChanges.pipe(
                    map((state_name) =>
                        state_name
                            ? APP_UTILITIES.FILTER_STATE(
                                  state_name,
                                  this.eventStates
                              )
                            : this.eventStates
                    )
                );
            this.states$ = this.mapFilterForm
                .get('stateControl')
                .valueChanges.pipe(
                    map((state_name) =>
                        state_name
                            ? APP_UTILITIES.FILTER_STATE(
                                  state_name,
                                  this.states
                              )
                            : this.states
                    )
                );
        });
    }

    // TODO: update this
    updateEventFilter() {
        this.mapFilterForm;
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

    toggleStateSelection(state: State) {
        let numStates: number;
        state.selected = !state.selected;
        if (state.selected) {
            this.selectedStates.push(state);
        } else {
            const i = this.selectedStates.findIndex(
                (value) => value.state_name === state.state_name
            );
            this.selectedStates.splice(i, 1);
        }
        //Create a string containing the list of state abbreviations
        if (this.selectedStates !== undefined) {
            numStates = this.selectedStates.length;
            for (let numAbbrev = 0; numAbbrev < numStates; numAbbrev++) {
                if (numAbbrev === 0) {
                    this.setStateAbbrev = this.setStateAbbrev.concat(
                        this.selectedStates[numAbbrev].state_abbrev
                    );
                } else {
                    this.setStateAbbrev = this.setStateAbbrev.concat(
                        ',' + this.selectedStates[numAbbrev].state_abbrev
                    );
                }
            }
        }
        //set the value of the state control to the full object of each state so that the list of state names can be displayed
        this.mapFilterForm.get('stateControl').setValue(this.selectedStates);
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
        this.eventMarkers = L.featureGroup([]);
        //Plot markers for selected event

        this.siteService
            .getEventSites(this.currentEvent)
            .subscribe((results) => {
                this.eventSites = results;
                this.mapResults(
                    this.eventSites,
                    this.eventIcon,
                    this.eventMarkers,
                    false
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

    eventFocus() {
        //If there are site markers, zoom to those
        //Otherwise, zoom back to default extent
        if (this.map.hasLayer(this.eventMarkers)) {
            this.map.fitBounds(this.eventMarkers.getBounds());
        } else {
            this.map.setView(
                MAP_CONSTANTS.defaultCenter,
                MAP_CONSTANTS.defaultZoom
            );
        }
    }
    // options to be displayed when selecting event filter
    displayEvent(event: Event): string {
        return event && event.event_name ? event.event_name : '';
    }
    //will return a comma separated list of selected states
    displayEventState(state: any): string {
        return state && state.state_name ? state.state_name : '';
    }
    //will return a comma separated list of selected states
    //prints list of states next to filter instead of filling the filter rectangle
    displayState(state: any): string {
        let stateCount: number;
        let stateIndex: number;
        let currentState: string;
        this.stateList = '';
        if (state !== null) {
            stateIndex = state.length;
        }
        for (stateCount = 0; stateCount < stateIndex; stateCount++) {
            currentState = state[stateCount].state_name;
            if (stateCount === 0) {
                this.stateList = this.stateList.concat(
                    ' Selected States: ' + currentState
                );
            } else {
                this.stateList = this.stateList.concat(', ' + currentState);
            }
        }
        document.getElementById('selectedStateList').innerHTML = this.stateList;
        return null;
    }
    //eventSites = the full site object to be mapped
    //myIcon = what the marker will look like
    //layerType = empty leaflet layer type
    //zoomToLayer = if true, will zoom to layer
    /* istanbul ignore next */
    mapResults(
        eventSites: any,
        myIcon: any,
        layerType: any,
        zoomToLayer: boolean
    ) {
        this.mapFilterForm.get('stateControl').setValue(this.selectedStates);

        // loop through results response from a search query
        if (eventSites.length !== undefined) {
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
            this.eventMarkers.addTo(this.map);
            //When filtering sites, zoom to layer, and open map pane
            if (zoomToLayer == true) {
                this.eventFocus();
                this.mapPanelState = true;
            }
        }
    }

    public clearMapFilterForm(): void {
        // this works but will not fully clear mat-selects if they're open when the box is clicked
        this.mapFilterForm.reset();
    }

    public submitMapFilter() {
        //close the filter panel
        this.filtersPanelState = false;
        //set the state control to the state abbreviations
        this.mapFilterForm.get('stateControl').setValue(this.setStateAbbrev);

        let filterParams = JSON.parse(JSON.stringify(this.mapFilterForm.value));

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

        //Clear current markers when a new filter is submitted
        if (this.map.hasLayer(this.eventMarkers)) {
            this.eventMarkers.removeFrom(this.map);
            this.eventMarkers = L.featureGroup([]);
        }
        this.siteService.getFilteredSites(urlParamString).subscribe((res) => {
            this.mapResults(res, this.eventIcon, this.eventMarkers, true);
        });
        return urlParamString;
    }
}
