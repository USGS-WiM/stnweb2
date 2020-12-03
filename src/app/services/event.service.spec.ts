import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Event } from '@interfaces/event';
import { EventService } from './event.service';
import { Site } from '@interfaces/site';

import { of, defer } from 'rxjs';

import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

export const mockEventsList: Event[] = APP_UTILITIES.EVENTS_DUMMY_DATA_LIST;
export const mockEvent: Event = APP_UTILITIES.DUMMY_EVENT;
export const mockSitesList: Site[] = APP_UTILITIES.SITES_DUMMY_DATA_LIST;

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

describe('EventService', () => {
    let httpTestingController: HttpTestingController;
    let service: EventService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EventService, HttpClient],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(EventService);
    });
    afterEach(() => {
        httpTestingController.verify();
        TestBed.resetTestingModule();
    });

    /// Tests begin ///
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#getAllEvents() should retrieve an events list from the data API', () => {
        service.getAllEvents().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockEventsList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.EVENTS + '.json'
        );
        req.flush(mockEventsList);
    });

    it('#getEvent() should retrieve a single event record from the data API', () => {
        service.getEvent(24).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(JSON.stringify(mockEvent));
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.EVENTS + 24 + '.json'
        );
        req.flush(mockEvent);
    });
});