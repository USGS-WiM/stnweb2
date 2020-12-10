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

import { HomeComponent } from './home.component';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '@app/app.settings';
import { MAP_CONSTANTS } from './map-constants';
import { DisplayValuePipe } from '@app/pipes/display-value.pipe';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomeComponent],
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
                HomeComponent,
                CurrentUserService,
                DisplayValuePipe,
                MatSnackBar,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        component = TestBed.inject(HomeComponent);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
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

    /*
    it('APP_UTILITIES.SORT returns an sorted list', () => {
        let unsorted = [
            { id: 1, value: 5 },
            { id: 2, value: 19 },
            { id: 3, value: 3 },
            { id: 4, value: 1 },
            { id: 5, value: 789 },
            { id: 6, value: 138 },
        ];
        let sorted = APP_UTILITIES.SORT(unsorted, 'value', 'ascend');
        expect(sorted).toEqual([
            { id: 4, value: 1 },
            { id: 3, value: 3 },
            { id: 1, value: 5 },
            { id: 2, value: 19 },
            { id: 6, value: 138 },
            { id: 5, value: 789 },
        ]);
    });
    */

    //  it('#display selected event returns ')

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
            'wil',
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

    it('should call displaySelectedEvent', () => {
        component.displaySelectedEvent();
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
        // temporarily sets map to U.S, extent instead of event's extent
        // first set the view to somehting not default to test that the update works
        // component.ngOnInit();
        // component.createMap();
        let notDefaultCenter = new L.LatLng(55.8283, -125.5795);
        component.map.setView(notDefaultCenter, 9);
        component.eventFocus();
        let mapCenter = component.map.getCenter();
        let mapZoom = component.map.getZoom();
        expect(mapCenter).toEqual(MAP_CONSTANTS.defaultCenter);
        expect(mapZoom).toEqual(MAP_CONSTANTS.defaultZoom);
    });

    it('mapFilterForm should be a valid form on submit', () => {
        component.submitMapFilter();
        expect(component.mapFilterForm.valid).toBe(true);
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
