import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CurrentUserService } from '@services/current-user.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatChipList, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
    startWith,
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
import { NoaaService } from '@services/noaa.service';
import { FiltersService } from '@services/filters.service';
import 'leaflet.markercluster';
import 'leaflet.markercluster.freezable';
import { Subscription } from 'rxjs';

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
    public removable = true;
    public addOnBlur = true;
    public filteredStates$: Observable<State[]>;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('statesList')
    statesList: MatChipList;

    sites = [];
    siteid: string;
    panelOpenState = false;
    errorMessage: string;
    map;
    icon;
    isloggedIn = APP_SETTINGS.IS_LOGGEDIN;
    currentFilter;
    isClicked = false;
    isMobile = window.matchMedia('(max-width: 875px)').matches;
    isSubmitted = false;
    firstLoaded = true;

    drawControl;
    drawnItems;

    // events = [];
    sitesData = L.featureGroup([]);
    siteSelected;
    siteClicked = false;
    siteName;

    //for the ALl STN Sites layer
    allSites: Site[];

    //NOAA layer
    stations = [];

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
    mapPanelMinimized: boolean = false;
    filtersPanelState: boolean = true;
    resultsPanelState: boolean;
    resultsPanelSubscription: Subscription;

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
    states: State[] = [];
    eventStates: State[];
    selectedStates: State[] = new Array<State>();
    stateString = '';

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
    noaaTidesVisible = false;

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

    //for NOAA station layer
    tideIcon = L.divIcon({ 
        className: 'wmm-diamond wmm-lime wmm-icon-triangle wmm-icon-black wmm-size-15 wmm-borderless', 
    });

    //Basemaps
    basemaps;

    osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.',
    });

    grayscale = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        }
    );
    imagery = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution:
                'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        }
    );

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
        public noaaService: NoaaService,
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
            stateControl: this.selectedStates,
            stateInput: [null],
            surveyedControl: null,
            HWMOnlyControl: false,
            sensorOnlyControl: false,
            surveyedOnlyControl: false,
            bracketSiteOnlyControl: false,
            RDGOnlyControl: false,
            OPDefinedControl: false,
        });

        this.filteredStates$ = this.mapFilterForm
            .get('stateInput')
            .valueChanges.pipe(
                startWith(''),
                map((value) => this.stateFilter(value))
            );
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

    public stateFilter(value: any): State[] {
        const filterValue =
            value === null || value instanceof Object
                ? ''
                : value.toLowerCase();
        const matches = this.states.filter((state) =>
            state.state_name.toLowerCase().includes(filterValue)
        );
        const formValue = this.mapFilterForm.get('stateControl').value;
        return formValue === null
            ? matches
            : matches.filter(
                  (x) =>
                      !formValue.find((y) => y.state_abbrev === x.state_abbrev)
              );
    }

    /////////////////////////////////////////////////////////////////////////////////////////
    /* istanbul ignore next */
    public selectState(event: MatAutocompleteSelectedEvent): void {
        if (!event.option) {
            return;
        }
        const value = event.option.value;
        if (
            value &&
            value instanceof Object &&
            !this.selectedStates.includes(value)
        ) {
            this.selectedStates.push(value);
            this.mapFilterForm
                .get('stateControl')
                .setValue(this.selectedStates);
            this.mapFilterForm.get('stateInput').setValue('');
        }
    }
    /* istanbul ignore next */
    public addState(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if (value.trim()) {
            const matches = this.states.filter(
                (state) => state.state_name.toLowerCase() === value
            );
            const formValue = this.mapFilterForm.get('stateControl').value;
            const matchesNotYetSelected =
                formValue === null
                    ? matches
                    : matches.filter(
                          (x) =>
                              !formValue.find(
                                  (y) => y.state_abbrev === x.state_abbrev
                              )
                      );
            if (matchesNotYetSelected.length === 1) {
                this.selectedStates.push(matchesNotYetSelected[0]);
                this.mapFilterForm
                    .get('stateControl')
                    .setValue(this.selectedStates);
                this.mapFilterForm.get('stateInput').setValue('');
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    /* istanbul ignore next */
    public remove(state: State) {
        const index = this.selectedStates.indexOf(state);
        if (index >= 0) {
            this.selectedStates.splice(index, 1);
            this.mapFilterForm
                .get('stateControl')
                .setValue(this.selectedStates);
            this.mapFilterForm.get('stateInput').setValue('');
        }
    }

    /* istanbul ignore next */
    setCurrentFilter() {
        this.currentFilter = localStorage.getItem('currentFilter')
            ? JSON.parse(localStorage.getItem('currentFilter'))
            : APP_SETTINGS.DEFAULT_FILTER_QUERY;
    }

    /* istanbul ignore next */
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
        //Add all the NOAA stations to a layer when the map and event list loads
        this.eventService.getAllEvents().toPromise().then((result) => {
            let eventResults = result;
            //sort the events by date, most recent at the top of the list
            eventResults = APP_UTILITIES.SORT(
                eventResults,
                'event_start_date',
                'descend'
            ); 
            this.noaaService.getTides().subscribe((results) => {
            this.stations = results;
            this.mapNoaaResults(
                this.stations,
                this.tideIcon,
                eventResults[0]
            );
            });
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
                    if (this.filterResultsComponent !== undefined){
                        this.filterResultsComponent.refreshDataSource();
                    }
                }, 1000);
            });
    }

    toggleMap() {
        this.mapPanelMinimized = !this.mapPanelMinimized;
        if (this.map) {
            var map = this.map;
            // this.streetMaps.redraw();
            // this.map.invalidateSize();
            // console.log("INVALIDATING")
            setTimeout(function () {
                map.invalidateSize();
            }, 100);
        }
    }

    createMap() {
        // instantiate leaflet map, with initial center, zoom level, and basemap
        this.map = new L.Map('map', {
            center: MAP_CONSTANTS.defaultCenter,
            zoom: MAP_CONSTANTS.defaultZoom,
            layers: [this.osm],
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
            if (e.name === 'NOAA Tides and Current Stations') {
                this.noaaTidesVisible = true;
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
            if (e.name === 'NOAA Tides and Current Stations') {
                this.noaaTidesVisible = false;
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
                'NOAA Tides and Current Stations': this.noaaService.tideMarkers,
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
                'NOAA Tides and Current Stations': this.noaaService.tideMarkers,
                'Current Warnings*': this.warnings,
                'Watches/Warnings*': this.watchesWarnings,
                "<span>AHPS Gages*</span> <br> <div class='leaflet-control-layers-separator'></div><span style='color: gray; text-align: center;'>*Zoom to level 9 to enable</span>": this
                    .AHPSGages,
            };
        }

        this.basemaps = {
            'Open Street Maps': this.osm,
            Grayscale: this.grayscale,
            Imagery: this.imagery,
        };

        this.layerToggles = L.control.layers(
            this.basemaps,
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
        let siteMarkersOnMap = this.map.hasLayer(this.siteService.siteMarkers);
        let manySiteMarkersOnMap = this.map.hasLayer(
            this.siteService.manyFilteredSitesMarkers
        );
        //If there are site markers, zoom to those
        //Otherwise, zoom back to default extent
        if (siteMarkersOnMap) {
            // Check if bounds are valid to avoid fitBounds error in getEventSites unit test
            if (this.siteService.siteMarkers.getBounds().isValid()){
                this.map.fitBounds(this.siteService.siteMarkers.getBounds());
            }
        } else if (manySiteMarkersOnMap) {
            // Check if bounds are valid to avoid fitBounds error in getEventSites unit test
            if (this.siteService.manyFilteredSitesMarkers.getBounds().isValid()){
                this.map.fitBounds(
                    this.siteService.manyFilteredSitesMarkers.getBounds()
                );
            }
        } else if (
            siteMarkersOnMap === false &&
            manySiteMarkersOnMap === false
        ) {
            this.map.setView(
                MAP_CONSTANTS.defaultCenter,
                MAP_CONSTANTS.defaultZoom
            );
        }
    }

    //get lat/lng for each NOAA station and add to tideMarkers layer group from siteService
    mapNoaaResults(stationList: any, myIcon: any, event: any) {
        if (stationList.count > 0 && stationList.stations !== undefined) {
            let stations = stationList.stations
            for (let station of stations) {
                let lat = Number(station.lat);
                let long = Number(station.lng);
                let stationId = station.id;
                let beginDate;
                let endDate;
                // If any filters but event are used, event will be a string instead of an object
                if (typeof(event) == 'string'){
                    beginDate = event.split(",")[0];
                    endDate = event.split(",")[1]
                }else{
                    beginDate = event.event_start_date.substr(0, 10);
                    beginDate = beginDate.replace("-", "");
                    beginDate = beginDate.replace("-", "");
                    endDate = event.event_end_date.substr(0, 10);
                    endDate = endDate.replace("-", "");
                    endDate = endDate.replace("-", "");
                }
                let gageUrl =
                "https://tidesandcurrents.noaa.gov/waterlevels.html?id=" +
                stationId +
                "&units=standard&bdate=" +
                beginDate +
                "&edate=" +
                endDate +
                "&timezone=GMT&datum=MLLW&interval=6&action=";
                //create popup with link to NOAA graph
                let popupContent =
                '<span><a target="_blank" href=' +
                gageUrl +
                ">Graph of Observed Water Levels at site " +
                stationId +
                "</a></span>";
                if (isNaN(lat) || isNaN(long)) {
                    console.log(
                        'Skipped station ' +
                        station.id +
                        ' in NOAA Station layer due to null lat/lng'
                );
                } else {
                    //These sites are in the Atlantic Ocean or otherwise clearly out of place
                    L.marker([lat, long], { icon: myIcon })
                        .bindPopup(popupContent)
                        .addTo(this.noaaService.tideMarkers);
                }
            }
        }else{
            console.log("No NOAA stations returned")
        }
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
        } else {
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

                //When filtering sites, zoom to layer, and open map pane
                if (zoomToLayer == true) {
                    this.siteFocus();
                    this.mapPanelMinimized = false;
                    if (this.map) {
                        var map = this.map;
                        setTimeout(function () {
                            map.invalidateSize();
                        }, 100);
                    }
                    //set the state control back to state names instead of abbreviations
                    this.mapFilterForm
                        .get('stateControl')
                        .setValue(this.selectedStates);
                }
            }
        }
    }

    public clearMapFilterForm(): void {
        //reset the event options
        this.updateEventFilter();
        this.selectedStates = new Array<State>();
        this.mapFilterForm.get('stateControl').setValue(this.selectedStates);
        this.mapFilterForm.get('stateInput').setValue([null]);
        // this works but will not fully clear mat-selects if they're open when the box is clicked
        this.mapFilterForm.reset();

        //remove markers and zoom to U.S.
        this.resultsReturned = false;
        this.resetPreviousOutput();
        this.siteFocus();

        // clear and close results table
        this.filtersService.updateSites([]);
        if (this.filterResultsComponent !== undefined) {
            this.filterResultsComponent.refreshDataSource();
        }
        this.filtersService.changeResultsPanelState(false);
        this.resultsPanelSubscription = this.filtersService.resultsPanelOpen.subscribe(
            (state) => (this.resultsPanelState = state)
        );
        //keep filters panel open
        this.filtersPanelState = true;

        // reset NOAA popups to links for most recent two week period
        let endDate = new Date();
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        let formatEndDate = endDate.getFullYear().toString() + (endDate.getMonth() + 1).toString().padStart(2, '0') + endDate.getDate().toString().padStart(2, '0');
        let formatStartDate = startDate.getFullYear().toString() + (startDate.getMonth() + 1).toString().padStart(2, '0') + startDate.getDate().toString().padStart(2, '0');
        let event = formatStartDate + "," + formatEndDate;
        this.mapNoaaResults(
            this.stations,
            this.tideIcon,
            event
        );
    }

    public submitMapFilter() {
        //each time filter is clicked, reset status of results
        this.resultsReturned = false;
        this.currentQuery = 0;
        this.totalQueries = 0;
        this.stateString = '';

        //Create string of state abbreviations
        if (this.mapFilterForm.get('stateControl').value !== null) {
            let numOfStates = this.mapFilterForm.get('stateControl').value
                .length;
            for (let i = 0; i < numOfStates; i++) {
                this.stateString = this.stateString.concat(
                    this.mapFilterForm.get('stateControl').value[i]
                        .state_abbrev + ','
                );
            }
        }

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
        let stateAbbrevs = this.stateString;
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

                let validSites = [];
                //Find sites that match the user's query
                this.siteService
                    .getFilteredSites(urlParamString)
                    .subscribe((res) => {
                        for (let i = 0; i < res.length; i++) {
                            //get current site id
                            let tempSiteID = res[i].site_id;
                            //skip over invalid sites
                            if (
                                tempSiteID !== 27857 &&
                                tempSiteID !== 27855 &&
                                tempSiteID !== 27853 &&
                                tempSiteID !== 27856 &&
                                tempSiteID !== 16052
                            ) {
                                validSites.push(res[i]);
                            }
                        }
                        this.getFilterResults(validSites);
                    });
                // Reload NOAA Tide and Current Stations if filters are changed
                this.eventService.getEvent(eventId).toPromise().then((result) => {
                    // If the event is changed, use event date range in popup
                    if (result.event_start_date !== undefined){
                        this.noaaService.getTides().subscribe((results) => {
                            this.stations = results;
                            this.mapNoaaResults(
                                this.stations,
                                this.tideIcon, 
                                result
                            );
                        });
                    } else{
                        // Use the previous 2 weeks as date range for link in NOAA layer popup if any filters but event are changed
                        let endDate = new Date();
                        let startDate = new Date();
                        startDate.setDate(startDate.getDate() - 14);
                        let formatEndDate = endDate.getFullYear().toString() + (endDate.getMonth() + 1).toString().padStart(2, '0') + endDate.getDate().toString().padStart(2, '0');
                        let formatStartDate = startDate.getFullYear().toString() + (startDate.getMonth() + 1).toString().padStart(2, '0') + startDate.getDate().toString().padStart(2, '0');
                        let event = formatStartDate + "," + formatEndDate;
                        this.mapNoaaResults(
                            this.stations,
                            this.tideIcon, 
                            event
                        );
                    }
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
                                        //skip over invalid sites
                                        if (
                                            tempSiteID !== 27857 &&
                                            tempSiteID !== 27855 &&
                                            tempSiteID !== 27853 &&
                                            tempSiteID !== 27856 &&
                                            tempSiteID !== 16052
                                        ) {
                                            siteIDs.push(tempSiteID);
                                            uniqueSites.push(res[i]);
                                        }
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

    openMapFilters(){
        // Viewing on mobile, change boolean value to hide or display map filters, map panel, and filter results
        this.isClicked = !this.isClicked;
    }

    onResize(){
        // Check screen size on window resize event
        this.isMobile = window.matchMedia('(max-width: 875px)').matches;
    }

    public getFilterResults(filterResponse) {
        //only call mapResults if the query returns data
        if (filterResponse.length > 0) {
            this.resetPreviousOutput();
            this.resultsReturned = true;
            this.filtersService.changeResultsPanelState(true);
            this.resultsPanelSubscription = this.filtersService.resultsPanelOpen.subscribe(
                (state) => (this.resultsPanelState = state)
            );
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

        // updating the filter-results table datasource with the new results
        this.filtersService.updateSites(filterResponse);
        if (this.filterResultsComponent !== undefined){
            this.filterResultsComponent.refreshDataSource();
        }
    }

    public resetPreviousOutput() {
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
        this.siteService.manyFilteredSitesMarkers = new L.markerClusterGroup({
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
        });
        //close the filter panel
        this.filtersPanelState = false;

        //close map filters on mobile when submitted
        this.isSubmitted = true;
        this.firstLoaded = false;
        this.isClicked = false;
    }
}
