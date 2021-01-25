import { Component, OnInit, Input, ViewChild } from '@angular/core';
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
import { FiltersService } from '@services/filters.service';
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
import { FilterResultsComponent } from '@app/filter-results/filter-results.component';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
    @ViewChild(FilterResultsComponent)
    filterResultsComponent: FilterResultsComponent;

    sites = [];
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
    sitesData = L.featureGroup([]);
    siteSelected;
    siteClicked = false;
    siteName;

    //for the ALl STN Sites layer
    allSites: Site[];

    public selectedEvent;
    currentSites;
    currentEvent: number; //change to subject?
    currentEventName: string;
    sitesDataArray: any;
    siteMarkers = L.featureGroup([]);

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

    //when filtering by multiple networks,
    //we use these to track if there are any sites returned after the final query
    totalQueries: number = 0;
    currentQuery: number = 0;
    //changes to true on load and when a filter returns results
    resultsReturned: boolean = false;

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
    sitesVisible = true;
    manyFiltered = false;
    watershedsVisible = false;
    currWarningsVisible = false;
    watchWarnVisible = false;
    ahpsGagesVisible = false;
    allSitesVisible = false;

    //Used for determining when to show layer visibility snack bar message
    currentZoom: number;
    previousZoom: number;

    layerToggles;
    searchControl;

    //for all map layers that aren't basemaps
    supplementaryLayers;

    public mapFilterForm: FormGroup;

    private displayedSites: Subject<Site[]> = new Subject<Site[]>();
    private setDisplayedSites;

    //for sites displayed on map load and when running queries
    filteredSitesIcon = L.divIcon({
        className:
            ' wmm-pin wmm-altblue wmm-icon-circle wmm-icon-white wmm-size-20',
    });
    //for the All STN Sites layer
    allSiteIcon = L.divIcon({
        className: ' allSiteIcon ',
        iconSize: 32,
    });

    manyFilteredSitesIcon = L.divIcon({
        className: ' manyFilteredSitesIcon ',
        iconSize: 32,
    });

    //supplementary layers
    HUC = esri.dynamicMapLayer({
        url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer',
        opacity: 0.7,
    });
    warnings = esri.featureLayer({
        url:
            'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/0',
        style: function () {
            return { color: 'red', weight: 2 };
        },
        minZoom: 9,
    });
    watchesWarnings = esri.featureLayer({
        url:
            'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/1',
        style: function () {
            return { color: 'orange', weight: 2 };
        },
        minZoom: 9,
    });
    AHPSGages = esri.featureLayer({
        url:
            'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/ahps_riv_gauges/MapServer/0',
        minZoom: 9,
        onEachFeature: function (feature, layer) {
            if (feature.properties.status == 'major') {
                layer.setIcon(L.divIcon({ className: 'gageIcon majorFlood' }));
            } else if (feature.properties.status == 'moderate') {
                layer.setIcon(
                    L.divIcon({
                        className: 'gageIcon moderateFlood',
                    })
                );
            } else if (feature.properties.status == 'minor') {
                layer.setIcon(L.divIcon({ className: 'gageIcon minorFlood' }));
            } else if (feature.properties.status == 'action') {
                layer.setIcon(L.divIcon({ className: 'gageIcon nearFlood' }));
            } else if (feature.properties.status == 'no_flooding') {
                layer.setIcon(L.divIcon({ className: 'gageIcon noFlood' }));
            } else if (feature.properties.status == 'not_defined') {
                layer.setIcon(L.divIcon({ className: 'gageIcon floodND' }));
            } else if (feature.properties.status == 'low_threshold') {
                layer.setIcon(
                    L.divIcon({
                        className: 'gageIcon belowThreshold',
                    })
                );
            } else if (feature.properties.status == 'obs_not_current') {
                layer.setIcon(
                    L.divIcon({
                        className: 'gageIcon obsNotCurrent',
                    })
                );
            } else if (feature.properties.status == 'out_of_service') {
                layer.setIcon(
                    L.divIcon({
                        className: 'gageIcon outOfService',
                    })
                );
            }
        },
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
        public filtersService: FiltersService,
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

        this.filtersService.selectedSites.subscribe(
            (currentSites) => (this.currentSites = currentSites)
        );
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
            //set up call to get sites for specific event
            this.displayMostRecentEvent();
            // allow user to type into the event selector to view matching events
            this.getEventList();
        });
        //Get states to fill state filters
        this.stateService.getStates().subscribe((results) => {
            this.eventStates = results;
            this.states = results;
            this.eventStates$ = this.mapFilterForm
                .get('eventStateControl')
                .valueChanges.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
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
                    debounceTime(300),
                    distinctUntilChanged(),
                    map((state_name) =>
                        state_name
                            ? APP_UTILITIES.FILTER_STATE(
                                  state_name,
                                  this.states
                              )
                            : this.states
                    )
                );
            //when user deletes previous event state selection, clear event filter
            //set so that if it is partially deleted (e.g. California => Calif), it won't change
            this.mapFilterForm
                .get('eventStateControl')
                .valueChanges.subscribe((stateObject) => {
                    if (stateObject === '') {
                        this.updateEventFilter();
                    }
                });
        });
        //Add all the STN sites to a layer when the map loads
        this.siteService.getAllSites().subscribe((results) => {
            this.allSites = results;
            this.resultsReturned = true;
            this.mapResults(
                this.allSites,
                this.allSiteIcon,
                this.siteService.allSiteMarkers,
                false
            );
        });
        this.mapFilterForm
            .get('surveyedControl')
            .valueChanges.subscribe((surVal) => {
                //when 'clear filters' button is clicked, surVal is null, which would cause surVal[x] to trigger a console error
                if (surVal !== null) {
                    //if the Surveyed button was selected, and user pressed the Not Surveyed button,
                    // turn off the Surveyed button and set url survey param to false
                    if (surVal[0] === 'true' && surVal[1] === 'false') {
                        this.mapFilterForm
                            .get('surveyedControl')
                            .setValue(['false']);
                    }
                    //if the  Not Surveyed button was selected, and user pressed the Surveyed button,
                    //turn off the Not Surveyed button and set url survey param to true
                    if (surVal[0] === 'false' && surVal[1] === 'true') {
                        this.mapFilterForm
                            .get('surveyedControl')
                            .setValue(['true']);
                    }
                }
            });
    }

    getEventList() {
        //setting filteredEvents$ to null for a moment will clear the old selection list
        //new list of options won't appear until user begins typing
        this.filteredEvents$ = null;
        this.filteredEvents$ = this.mapFilterForm
            .get('eventsControl')
            .valueChanges.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                /* istanbul ignore else */
                map((searchTerm) =>
                    searchTerm
                        ? APP_UTILITIES.FILTER_EVENT(searchTerm, this.events)
                        : this.events
                )
            );
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
                //reset filteredEvents$ so that it will update on value change
                this.getEventList();
                //Reset event value to null; previous selection will disappear from filter
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
        document.getElementById('selectedStateList').innerHTML = '';
        this.setStateAbbrev = '';
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
    //Temporary message pop up when user zooms out and layers are removed
    openZoomOutSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, {
            duration: duration,
        });
    }
    //Temporary message pop up when user's query returns no data
    filtersSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, {
            duration: duration,
            panelClass: ['no-data-warning'],
        });
    }
    //TODO: LOOK HERE FIRST
    displayMostRecentEvent() {
        //Get id and name of most recent event
        if (this.events.length > 0) {
            this.currentEvent = this.events[0].event_id;
            this.currentEventName = this.events[0].event_name;
        }

        //Clear the old markers from the layer
        this.siteService.siteMarkers.clearLayers();

        //Plot markers for selected event
        this.siteService
            .getEventSites(this.currentEvent)
            .subscribe((results) => {
                this.resultsReturned = true;
                this.sitesDataArray = results;
                this.filtersService.updateSites(results);
                this.mapResults(
                    this.sitesDataArray,
                    this.filteredSitesIcon,
                    this.siteService.siteMarkers,
                    true
                );
                setTimeout(() => {
                    // setting filter-results table to default display
                    this.filterResultsComponent.refreshDataSource();
                }, 500);
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

        this.createDrawControls();
        this.createLayerControl(true);

        //create lat/lng/zoom icon
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

        this.createSearchControl();

        // When layer is checked, add layer icon to legend
        /* istanbul ignore next */
        this.map.on('overlayadd', (e) => {
            if (e.name === 'Sites') {
                this.sitesVisible = true;
            }
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
            if (e.name === 'Sites') {
                this.sitesVisible = false;
            }
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
                this.siteService.allSiteMarkers.disableClustering();
                this.siteService.manyFilteredSitesMarkers.disableClustering();
            }
            if (this.currentZoom < 12) {
                this.siteService.allSiteMarkers.enableClustering();
                this.siteService.manyFilteredSitesMarkers.enableClustering();
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
    }

    createLayerControl(wimPin: boolean) {
        if (wimPin === true) {
            this.supplementaryLayers = {
                Sites: this.siteService.siteMarkers,
                Watersheds: this.HUC,
                'All STN Sites': this.siteService.allSiteMarkers,
                'Current Warnings*': this.warnings,
                'Watches/Warnings*': this.watchesWarnings,
                "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>": this
                    .AHPSGages,
            };
        }
        if (wimPin === false) {
            this.supplementaryLayers = {
                Sites: this.siteService.manyFilteredSitesMarkers,
                Watersheds: this.HUC,
                'All STN Sites': this.siteService.allSiteMarkers,
                'Current Warnings*': this.warnings,
                'Watches/Warnings*': this.watchesWarnings,
                "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>": this
                    .AHPSGages,
            };
        }

        this.layerToggles = L.control.layers(
            MAP_CONSTANTS.baseMaps,
            this.supplementaryLayers,
            {
                position: 'topleft',
            }
        );
        this.layerToggles.addTo(this.map);
    }

    createSearchControl() {
        this.searchControl = new esri_geo.geosearch().addTo(this.map);

        //This layer will contain the location markers
        const results = new L.LayerGroup().addTo(this.map);

        //Clear the previous search marker and add a marker at the new location
        /* istanbul ignore next */
        this.searchControl.on('results', function (data) {
            results.clearLayers();
            for (let i = data.results.length - 1; i >= 0; i--) {
                results.addLayer(L.marker(data.results[i].latlng));
            }
        });
    }

    createDrawControls() {
        const drawnItems = L.featureGroup().addTo(this.map);

        //User can select from drawing a line or polygon; other options are disabled
        //Measurements are in miles
        this.drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems,
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

        // Truncate value based on number of decimals
        const _round = function (num, len) {
            return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
        };

        // Generate popup content based on layer type
        // - Returns HTML string, or null if unknown object
        /* istanbul ignore next */
        function getPopupContent(layer) {
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
                    return 'Distance: ' + _round(distance, 2) + ' mi';
                }
            }
            return null;
        }

        // Object created - bind popup to layer, add to feature group
        /* istanbul ignore next */
        this.map.on(L.Draw.Event.CREATED, function (event) {
            const layer = event.layer;
            const content = getPopupContent(layer);
            if (content !== null) {
                layer.bindPopup(content);
            }
            drawnItems.addLayer(layer);
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
    }

    siteFocus() {
        //If there are site markers, zoom to those
        //Otherwise, zoom back to default extent
        if (this.map.hasLayer(this.siteService.siteMarkers)) {
            this.map.fitBounds(this.siteService.siteMarkers.getBounds());
        } else if (
            this.map.hasLayer(this.siteService.manyFilteredSitesMarkers)
        ) {
            this.map.fitBounds(
                this.siteService.manyFilteredSitesMarkers.getBounds()
            );
        } else if (
            this.map.hasLayer(
                this.siteService.manyFilteredSitesMarkers === false &&
                    this.map.hasLayer(this.siteService.siteMarkers) === false
            )
        ) {
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

    //sites = the full site object to be mapped
    //myIcon = what the marker will look like
    //layerType = empty leaflet layer type
    //zoomToLayer = if true, will zoom to layer
    /* istanbul ignore next */
    mapResults(sites: any, myIcon: any, layerType: any, zoomToLayer: boolean) {
        //if it is on the final query (relevant for multiple network requests),
        //and there have not been any results returned, show no results message
        if (this.resultsReturned === false) {
            if (this.currentQuery === this.totalQueries) {
                this.filtersSnackBar(
                    'No results for your query. Try using fewer filters.',
                    'OK',
                    4500
                );
            }
        }
        // loop through results response from a search query
        if (sites.length !== undefined) {
            for (let site of sites) {
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
                    if (site.Events.length > 0) {
                        if (site.Events.length === 1) {
                            popupContent +=
                                '<span class="popupLabel"><b>Event</b>:</span> ' +
                                site.Events.join(', ') +
                                '<br/>';
                        } else {
                            popupContent +=
                                '<span class="popupLabel"><b>Events</b>:</span> ' +
                                site.Events.join(', ') +
                                '<br/>';
                        }
                    }
                }
                /* istanbul ignore next */
                if (isNaN(lat) || isNaN(long)) {
                    console.log(
                        'Skipped site ' +
                            site.site_no +
                            ' in All STN Sites layer due to null lat/lng'
                    );
                } else {
                    //These sites are in the Atlantic Ocean or otherwise clearly out of place
                    if (
                        site.site_no !== 'AKALE27857' &&
                        site.site_no !== 'AKALE27855' &&
                        site.site_no !== 'ASTUT27853' &&
                        site.site_no !== 'AZGRA27856'
                    ) {
                        //put all the site markers in the same layer group
                        if (layerType === this.siteService.siteMarkers) {
                            L.marker([lat, long], { icon: myIcon })
                                .bindPopup(popupContent)
                                .addTo(layerType);
                        }
                        //Make circle markers for the All STN Sites layer
                        if (
                            layerType == this.siteService.allSiteMarkers ||
                            layerType ===
                                this.siteService.manyFilteredSitesMarkers
                        ) {
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
        }

        if (
            layerType === this.siteService.siteMarkers ||
            layerType === this.siteService.manyFilteredSitesMarkers
        ) {
            //if there are multiple queries, wait until the last one to zoom to the layer

            if (layerType === this.siteService.siteMarkers) {
                this.siteService.siteMarkers.addTo(this.map);
            }
            if (layerType === this.siteService.manyFilteredSitesMarkers) {
                this.siteService.manyFilteredSitesMarkers.addTo(this.map);
            }
            this.sitesVisible = true;
            //refresh layer control to connect it with new sites
            this.map.removeControl(this.layerToggles);
            //draw & search controls need to be removed and re-added after the layer control so they appear in the correct position
            this.map.removeControl(this.drawControl);
            this.map.removeControl(this.searchControl);
            if (layerType === this.siteService.siteMarkers) {
                this.createLayerControl(true);
            }
            if (layerType === this.siteService.manyFilteredSitesMarkers) {
                this.createLayerControl(false);
            }
            this.createSearchControl();
            this.createDrawControls();
            this.map.setView(MAP_CONSTANTS.defaultCenter, 10);

            //When filtering sites, zoom to layer, and open map pane
            if (zoomToLayer == true) {
                this.siteFocus();
                this.mapPanelState = true;
                //set the state control back to state names instead of abbreviations
                this.mapFilterForm
                    .get('stateControl')
                    .setValue(this.selectedStates);
            }
        }
    }

    public clearMapFilterForm(): void {
        //reset the event options
        this.updateEventFilter();
        this.selectedStates = new Array<State>();
        // this works but will not fully clear mat-selects if they're open when the box is clicked
        this.mapFilterForm.reset();
    }

    public submitMapFilter() {
        //each time filter is clicked, reset status of results
        this.resultsReturned = false;
        this.currentQuery = 0;
        this.totalQueries = 0;
        //set the state control to the state abbreviations
        this.mapFilterForm.get('stateControl').setValue(this.setStateAbbrev);
        document.getElementById('selectedStateList').innerHTML = '';

        let filterParams = JSON.parse(JSON.stringify(this.mapFilterForm.value));

        //if multiple networks are selected, we need to keep the network ids in an array
        let multiNetworkIds = this.mapFilterForm.get('networkControl').value;

        //prevents multiNetworkIds.length from erroring out
        if (multiNetworkIds == null) {
            multiNetworkIds = [];
        }

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

        //Too few filters can lead to too many sites and a slow response time
        //Force the user to select at least one of the following filters
        if (
            eventId == '' &&
            networkIds == '' &&
            sensorIds == '' &&
            stateAbbrevs == ''
        ) {
            this.filtersSnackBar(
                'Please select at least one Event, Network, Sensor, or State filter.',
                'OK',
                4500
            );
            //If the user has at least one Event, Network, Sensor, or State filter select, continue with http request
        } else {
            //network ids need to be called one at a time, so if there are multiple we put them in separate http requests
            if (multiNetworkIds.length <= 1) {
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

                //Find sites that match the user's query
                this.siteService
                    .getFilteredSites(urlParamString)
                    .subscribe((res) => {
                        this.getFilterResults(res);
                    });
            } else {
                //User could potentially crash the app by choosing too many networks, thereby returning too many results
                //if > 5 networks are selected, prevent query from running and show warning
                if (multiNetworkIds.length > 5) {
                    this.filtersSnackBar(
                        'Please limit your selection to 5 networks.',
                        'OK',
                        4500
                    );
                } else {
                    //to be populated with each unique site object
                    let uniqueSites = [];
                    //to keep a running list of all site ids
                    let siteIDs = [];
                    this.totalQueries = multiNetworkIds.length;
                    //for every network id, create a separate http request
                    for (let i = 0; i < multiNetworkIds.length; i++) {
                        let urlParamString =
                            'Event=' +
                            eventId +
                            '&State=' +
                            stateAbbrevs +
                            '&SensorType=' +
                            sensorIds +
                            '&NetworkName=' +
                            multiNetworkIds[i] +
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
                        this.siteService
                            .getFilteredSites(urlParamString)
                            .subscribe((res) => {
                                //filter out sites that have already been plotted
                                for (let i = 0; i < res.length; i++) {
                                    //get current site id
                                    let tempSiteID = res[i].site_id;
                                    //if the current site id isn't in our list of all sites,
                                    //add that site object to uniqueSites
                                    if (!siteIDs.includes(tempSiteID)) {
                                        siteIDs.push(tempSiteID);
                                        uniqueSites.push(res[i]);
                                    }
                                }
                                this.currentQuery += 1;
                                //map results after network is complete
                                if (this.currentQuery === this.totalQueries) {
                                    this.getFilterResults(uniqueSites);
                                }
                            });
                    }
                }
            }
        }
    }

    public getFilterResults(filterResponse) {
        //only call mapResults if the query returns data
        if (filterResponse.length > 0) {
            this.resetPreviousOutput();
        }
        //if there are less than 500 sites, use the normal WIM pin
        if (filterResponse.length < 500) {
            this.manyFiltered = false;
            this.mapResults(
                filterResponse,
                this.filteredSitesIcon,
                this.siteService.siteMarkers,
                true
            );
        }
        //if there are 500 sites or more, use marker clusters
        if (filterResponse.length >= 500) {
            this.manyFiltered = true;
            this.mapResults(
                filterResponse,
                this.manyFilteredSitesIcon,
                this.siteService.manyFilteredSitesMarkers,
                true
            );
        }
    }

    public resetPreviousOutput() {
        if (this.resultsReturned === false) {
            // updating the filter-results table datasource with the new results
            this.filterResultsComponent.refreshDataSource();
            //if the sites layer is checked off, need to re-add it to fully remove old markers before adding new ones
            if (this.map.hasLayer(this.siteService.siteMarkers) === false) {
                this.siteService.siteMarkers.addTo(this.map);
            }
            if (
                this.map.hasLayer(this.siteService.manyFilteredSitesMarkers) ===
                false
            ) {
                this.siteService.manyFilteredSitesMarkers.addTo(this.map);
            }
            //Clear current markers when a new filter is submitted
            this.siteService.siteMarkers.removeFrom(this.map);
            this.siteService.siteMarkers = L.featureGroup([]);
            this.siteService.manyFilteredSitesMarkers.removeFrom(this.map);
            this.siteService.manyFilteredSitesMarkers = new L.markerClusterGroup(
                {
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
                            className: 'manyFilteredSitesIcon',
                            iconSize: L.point(32, 32),
                        });
                    },
                }
            );
            //close the filter panel
            this.filtersPanelState = false;
            this.resultsReturned = true;
        }
    }
}
