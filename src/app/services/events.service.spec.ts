import { HttpClient, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EventsService } from './events.service';
import { of, defer } from 'rxjs';

import { Event } from '@interfaces/event';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

export const mockEventsList: Event[] = APP_UTILITIES.EVENTS_DUMMY_DATA_LIST;

describe('EventsService', () => {
    let service: EventsService;

    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    let dummyEventsList: Event[];

    let httpClientSpy: { get: jasmine.Spy };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EventsService, HttpClient, HttpHandler],
        });
        service = TestBed.inject(EventsService);
        httpTestingController = TestBed.inject(HttpTestingController);

        dummyEventsList = APP_UTILITIES.EVENTS_DUMMY_DATA_LIST;
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

        // Inject the http service and test controller for each test
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        httpTestingController.verify();
    });

    /// Tests begin ///

    // NOTE: This is a work in progress. The main holdup is the failure of getAllEvents() to return
    // data though it does in the actual component. B Draper 11/12/20

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    xit('#getAllEvents should retrieve an events list from the data API (method 1) ', async () => {
        service.getAllEvents().subscribe((results) => {
            // problem: this returns an empty array every time
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(JSON.stringify(mockEventsList));
        });
        const req = httpTestingController
            .expectOne(APP_SETTINGS.EVENTS + '.json');

        req.flush(mockEventsList);
    });


    xit('#getAllEvents should retrieve an events list from the data API (method 2)', () => {

        let result: Event[];

        service.getAllEvents().subscribe(response => {
            // problem: this returns an empty array every time
            result = response;
            // expect(results.length).toBe(2);
            // expect(results).toEqual(dummyEventsList);n test
        });

        const request = httpTestingController.expectOne(APP_SETTINGS.EVENTS + '.json');
        expect(request.request.method).toBe('GET');

        request.flush(dummyEventsList);
        expect(result).toEqual(dummyEventsList);

    })

    xit('#getAllEvents should retrieve an events list from the data API  (HttpClient called once) (method 3)', async () => {
        const expectedEvents: Event[] = APP_UTILITIES.EVENTS_DUMMY_DATA_LIST;

        // httpClientSpy.get.and.returnValue(of(expectedEvents));
        httpClientSpy.get.and.returnValue(responseData(expectedEvents));

        service.getAllEvents().subscribe(
            events => expect(events).toEqual(expectedEvents, 'expected events'),
            fail
        );
        expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
    });
});
