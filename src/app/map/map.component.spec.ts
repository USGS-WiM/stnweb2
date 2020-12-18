import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MapComponent],
            imports: [
                BrowserAnimationsModule,
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

    it('#display event returns the event name', () => {
        const event: Event = {
            event_id: 24,
            event_name: 'Sandy',
            event_start_date: '2012-10-21T04:00:00',
            event_end_date: '2012-10-30T04:00:00',
            event_description: '',
            event_type_id: 2,
            event_status_id: 2,
            event_coordinator: 36,
            instruments: [],
            hwms: [],
        };
        expect(component.displayEvent(event)).toBe('Sandy');
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

    it('should call getFilteredSites and return list of queried sites', () => {
        const response: Site[] = [];
        spyOn(component.siteService, 'getFilteredSites').and.returnValue(
            of(response)
        );
        component.submitMapFilter();
        fixture.detectChanges();
        expect(component.sites).toEqual(response);
    });

    it('displayEventState returns the appropriate response', () => {
        let state = {
            counties: null,
            selected: true,
            state_abbrev: 'AK',
            state_id: 2,
            state_name: 'Alaska',
        };
        let response = component.displayEventState(state);
        expect(response).toEqual(state && state.state_name);
    });

    it('displayState returns null', () => {
        let state = {
            counties: null,
            selected: true,
            state_abbrev: 'AK',
            state_id: 2,
            state_name: 'Alaska',
        };
        let displayStateResponse = component.displayState(state);
        expect(displayStateResponse).toEqual(null);
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

    it('#getDrawnItemPopupContent returns the appropriate content response', () => {
        // component.ngOnInit();
        // component.createMap();
        let latlngs = [
            [37, -109.05],
            [41, -109.03],
            [41, -102.05],
            [37, -102.04],
        ];
        var polygon = L.polygon(latlngs, { color: 'red' }).addTo(component.map);
        let polygonResponse = component.getDrawnItemPopupContent(polygon);
        expect(polygonResponse).toEqual(jasmine.any(String));
        expect(polygonResponse).toContain('Area: ');

        var line = L.polyline(latlngs, { color: 'blue' }).addTo(component.map);
        let lineResponse = component.getDrawnItemPopupContent(line);
        expect(lineResponse).toEqual(jasmine.any(String));
        expect(lineResponse).toContain('Distance: ');

        var notLine = L.polyline([latlngs[0]], { color: 'blue' }).addTo(
            component.map
        );
        let notLineResponse = component.getDrawnItemPopupContent(notLine);
        expect(notLineResponse).toEqual(jasmine.any(String));
        expect(notLineResponse).toContain('Distance: N/A');

        let notLayer = L.popup();
        let notLayerResponse = component.getDrawnItemPopupContent(notLayer);
        expect(notLayerResponse).toBeNull();
    });

    it('#eventFocus sets map to event focused view', () => {
        // first set the view to somehting not default to test that the update works
        let notDefaultCenter = new L.LatLng(55.8283, -125.5795);
        component.map.setView(notDefaultCenter, 9);
        component.eventFocus();
        let mapCenter = component.map.getCenter();
        let mapZoom = component.map.getZoom();
        expect(mapCenter).toEqual(MAP_CONSTANTS.defaultCenter);
        expect(mapZoom).toEqual(MAP_CONSTANTS.defaultZoom);
    });

    it('mapFilterForm should be valid after toggleStateSelection', () => {
        let state = {
            counties: null,
            selected: true,
            state_abbrev: 'AK',
            state_id: 2,
            state_name: 'Alaska',
        };
        component.toggleStateSelection(state);
        expect(component.mapFilterForm.valid).toBe(true);
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
        component.mapFilterForm.get('eventsControl').setValue(291);
        component.mapFilterForm.get('sensorTypeControl').setValue('');
        component.mapFilterForm.value.surveyedControl = 'Surveyed';
        component.mapFilterForm.value.HWMOnlyControl = '1';
        component.mapFilterForm.value.bracketSiteOnlyControl = '1';
        component.mapFilterForm.value.RDGOnlyControl = '1';
        component.mapFilterForm.value.OPDefinedControl = '1';
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

    xit('#displayState', () => {});
});
