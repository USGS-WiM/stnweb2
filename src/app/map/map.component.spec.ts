import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentUserService } from '@services/current-user.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { of } from 'rxjs';

// import { by } from '@angular/platform-browser';
import {
    FormsModule,
    ReactiveFormsModule,
    FormBuilder,
    FormControl,
    FormGroup,
} from '@angular/forms';

declare let L: any;
import 'leaflet';
import 'leaflet-draw';

import { Event } from '@interfaces/event';

import { MapComponent } from './map.component';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '@app/app.settings';
import { MAP_CONSTANTS } from './map-constants';
import { DisplayValuePipe } from '@app/pipes/display-value.pipe';
import { Site } from '@app/interfaces/site';
import { State } from '@app/interfaces/state';
import { NoaaStation } from '@app/interfaces/noaa-station';
import { compileComponentFromMetadata } from '@angular/compiler';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MapComponent],
            imports: [
                NoopAnimationsModule,
                MatAutocompleteModule,
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MatSelectModule,
                MatFormFieldModule,
                MatInputModule,
                HttpClientTestingModule,
                MatToolbarModule,
                MatIconModule,
                MatExpansionModule,
                MatCardModule,
                MatTableModule,
                MatPaginatorModule,
                MatButtonModule,
                MatAutocompleteModule,
                MatSnackBarModule,
                MatDialogModule,
                MatTabsModule,
                MatFormFieldModule,
                MatCheckboxModule,
                MatInputModule,
                MatSelectModule,
                MatButtonToggleModule,
                MatRadioModule,
                ReactiveFormsModule,
            ],
            providers: [
                MapComponent,
                CurrentUserService,
                DisplayValuePipe,
                MatSnackBar,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        component = TestBed.inject(MapComponent);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('leaflet map should be initialized', () => {
        // component.ngOnInit();
        // component.createMap();
        expect(component.map).toBeDefined();
    });

    it('APP_UTILITIES.SCALE_LOOKUP returns a correct value', () => {
        const scale = APP_UTILITIES.SCALE_LOOKUP(10);
        expect(scale).toBe('577,790');
    });

    it('APP_UTILITIES.ROUND returns an integer value', () => {
        const roundedNumber = APP_UTILITIES.ROUND(1.64987, 2);
        expect(roundedNumber).toBe(1.65);
    });

    it('APP_UTILITIES.FILTER_EVENT returns an array of matching events value given a partial name string input', () => {
        const response = APP_UTILITIES.FILTER_EVENT(
            'ilma',
            APP_UTILITIES.EVENTS_DUMMY_DATA_LIST
        );
        const expectedResponse: Event[] = [
            {
                event_id: 8,
                event_name: 'Wilma',
                event_start_date: '2005-10-20T00:00:00',
                event_end_date: '2005-10-31T00:00:00',
                event_description:
                    'Category 3 in west FL. \nHurricane Wilma was the most intense tropical cyclone ever recorded in the Atlantic basin. Part of the record breaking 2005 Atlantic hurricane season.',
                event_type_id: 2,
                event_status_id: 2,
                event_coordinator: 515,
                instruments: [],
                hwms: [],
            },
        ];
        expect(response).toEqual(expectedResponse);
    });

    it('currentFilter is set to user-stored filter if it exists', () => {
        localStorage.setItem('currentFilter', '[1, 7, 8, 15]');
        component.setCurrentFilter();
        expect(component.currentFilter).toEqual(JSON.parse('[1, 7, 8, 15]'));
    });

    it('currentFilter is set to default if no storage filter set', () => {
        localStorage.clear();
        component.setCurrentFilter();
        expect(component.currentFilter).toEqual(
            APP_SETTINGS.DEFAULT_FILTER_QUERY
        );
    });

    it('on load, should call getAllSites and return list of all sites', () => {
        const response: Site[] = [];
        spyOn(component.siteService, 'getAllSites').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.sites).toEqual(response);
    });

    it('should call getStates and return list of all states', () => {
        const response: State[] = [];
        spyOn(component.stateService, 'getStates').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.states).toEqual(response);
        expect(component.eventStates).toEqual(response);
    });

    it('should set survey control to false when the surveyed button is on and the no surveyed button is clicked', () => {
        component.getData();
        component.mapFilterForm
            .get('surveyedControl')
            .setValue(['true', 'false']);
        fixture.detectChanges();
        expect(component.mapFilterForm.get('surveyedControl').value).toEqual([
            'false',
        ]);
    });

    it('should set survey control to true when the no surveyed button is on and the surveyed button is clicked', () => {
        component.getData();
        component.mapFilterForm
            .get('surveyedControl')
            .setValue(['false', 'true']);
        fixture.detectChanges();
        expect(component.mapFilterForm.get('surveyedControl').value).toEqual([
            'true',
        ]);
    });

    it('should call filterEvents and return list of filtered events', () => {
        const response: Event[] = [];
        spyOn(component.eventService, 'filterEvents').and.returnValue(
            of(response)
        );
        component.updateEventFilter();
        fixture.detectChanges();
        expect(component.events).toEqual(response);
    });

    it('should call getAllEvents and return list of all events', () => {
        const response: Event[] = [];
        spyOn(component.eventService, 'getAllEvents').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.events).toEqual(response);
    });

    it('should call getEventSites and return results', () => {
        //pretend that Allegheny Dam release is most recent event
        component.events = [
            {
                event_id: 289,
                event_name: 'Allegheny Kinzua Dam release Spring 2019',
                event_start_date: '2019-05-10T05:00:00',
                event_end_date: '2019-06-10T05:00:00',
                event_description: 'Controlled release study',
                event_type_id: 1,
                event_status_id: 1,
                event_coordinator: 35,
                instruments: [],
                hwms: [],
            },
        ];
        const response: Site[] = [];
        spyOn(component.siteService, 'getEventSites').and.returnValue(
            of(response)
        );
        component.displayMostRecentEvent();
        fixture.detectChanges();
        expect(component.resultsReturned).toEqual(true);
        expect(component.sitesDataArray).toEqual(response);
    });

    it('should call getTides on load and return list of all stations', async() => {
        const response: NoaaStation[] = [];
        await component.eventService.getAllEvents();
        spyOn(component.noaaService, 'getTides').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.stations).toEqual(response);
    });

    it('should call getTides and return list of all stations', async() => {
        const response: NoaaStation[] = [];
        const eventId = 8;
        await component.eventService.getEvent(eventId);
        spyOn(component.noaaService, 'getTides').and.returnValue(
            of(response)
        );
        component.submitMapFilter();
        fixture.detectChanges();
        expect(component.stations).toEqual(response);
    });

    it('clustering should be disabled in all sites layer when zoomed to 12 or higher', () => {
        component.map.setZoom(12);
        fixture.detectChanges();
        expect(component.siteService.allSiteMarkers.disableClustering())
            .toBeTrue;
    });

    it('AHPS Gage, current warnings, and watches/warnings layers should be removed when map zooms out to 8', () => {
        component.ahpsGagesVisible = true;
        component.currWarningsVisible = true;
        component.watchWarnVisible = true;
        component.map.addLayer(component.AHPSGages);
        component.map.addLayer(component.warnings);
        component.map.addLayer(component.watchesWarnings);
        component.map.setZoom(9);
        component.map.setZoom(8);
        component.map.zoom = 8;
        fixture.detectChanges();
        expect(component.map.hasLayer(component.AHPSGages)).toBeFalse;
        expect(component.map.hasLayer(component.warnings)).toBeFalse;
        expect(component.map.hasLayer(component.watchesWarnings)).toBeFalse;
    });

    it('there should be as many queries as there are networks', () => {
        component.mapFilterForm.get('networkControl').setValue([1, 2, 3]);
        const response: Site[] = [];
        spyOn(component.siteService, 'getFilteredSites').and.returnValue(
            of(response)
        );
        component.submitMapFilter();
        fixture.detectChanges();
        expect(component.totalQueries).toEqual(3);
    });

    it('should call getFilteredSites and return list of queried sites', () => {
        const response: Site[] = [];
        spyOn(component.siteService, 'getFilteredSites').and.returnValue(
            of(response)
        );
        component.submitMapFilter();
        fixture.detectChanges();
        expect(component.sites).toEqual(response);
    });

    it('should call getEventSites and return list of queried sites', () => {
        const response: Site[] = [];
        spyOn(component.siteService, 'getEventSites').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        // expect(component.sitesDataArray).toEqual(response);
    });

    it('should call openZoomOutSnackBar', () => {
        let message = 'hello';
        let action = 'OK';
        let duration = 5;
        component.openZoomOutSnackBar(message, action, duration);
    });

    it('should call updateEventFilter', () => {
        component.updateEventFilter();
    });

    it('#siteFocus sets map to filtered sites extent', () => {
        //zoom to sites or default zoom
        component.siteFocus();
        let mapZoom = component.map.getZoom();
        //zoom to somewhere else
        let notDefaultCenter = new L.LatLng(55.8283, -125.5795);
        component.map.setView(notDefaultCenter, 3);
        //zoom back to filtered sites
        component.siteFocus();
        fixture.detectChanges();
        //map should have zoomed back to sites or default
        expect(component.map.getZoom()).toEqual(mapZoom);
    });

    it('mapFilterForm should be a valid form on submit', () => {
        component.submitMapFilter();
        component.mapFilterForm.value.eventsControl = true;
        expect(component.mapFilterForm.valid).toBe(true);
    });

    it('mapFilterForm should test all variations', () => {
        component.mapFilterForm.get('stateControl').setValue('NC');
        component.mapFilterForm.get('networkControl').setValue([1, 2, 3]);
        component.mapFilterForm.get('sensorOnlyControl').setValue('1');
        component.mapFilterForm.get('HWMOnlyControl').setValue('1');
        component.mapFilterForm.get('bracketSiteOnlyControl').setValue('1');
        component.mapFilterForm.get('RDGOnlyControl').setValue('1');
        component.mapFilterForm.get('OPDefinedControl').setValue('1');
        component.mapFilterForm.get('eventsControl').setValue(291);
        component.mapFilterForm.get('sensorTypeControl').setValue('Webcam');
        component.mapFilterForm.value.surveyedControl = 'Surveyed';
        component.submitMapFilter();
        expect(component.mapFilterForm).toBeTruthy;
        expect(component.mapFilterForm.value.eventsControl).toEqual(291);
        //expect(component.mapResults).toHaveBeenCalled();
        //expect(component.submitMapFilter().urlParamString).toBe('Event=7&State=California&SensorType=Webcam&NetworkName=SWaTH&OPDefined=1&HWMOnly=');
    });

    it('#clearMapFilterForm resets the filter form', () => {
        component.clearMapFilterForm();
        let formValues = component.mapFilterForm.value;
        expect(formValues.eventsControl).toBeFalsy();
        expect(formValues.networkControl).toBeFalsy();
        expect(formValues.sensorControl).toBeFalsy();
        expect(formValues.stateControl).toBeFalsy();
        expect(formValues.surveyedControl).toBeFalsy();
        expect(formValues.surveyedOnlyControl).toBeFalsy();
        expect(formValues.bracketSiteOnlyControl).toBeFalsy();
        expect(formValues.RDGOnlyControl).toBeFalsy();
        expect(formValues.OpDefinedControl).toBeFalsy();
    });

    it('#remove works', () => {
        component.stateFilter('north caro');
        let stateToRemove = {
            state_id: 38,
            state_name: 'North Carolina',
            state_abbrev: 'NC',
            counties: null,
        };
        component.remove(stateToRemove);
        expect(component.mapFilterForm.get('stateControl').value).toEqual(null);
    });

    it ('map size should change', () => {
        component.toggleMap();
        expect(component.map.invalidateSize()).toBeTruthy();
    })
});
