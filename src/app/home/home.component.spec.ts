import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentUserService } from '@services/current-user.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { by } from '@angular/platform-browser';
import * as L from 'leaflet';

import { Event } from '@interfaces/event';

import { HomeComponent } from './home.component';
import { APP_UTILITIES } from '@app/app.utilities';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [MatAutocompleteModule],
            providers: [
                HomeComponent,
                CurrentUserService,
                HttpClient,
                HttpHandler,
            ],
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
});
