import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';

import { EventTypeService } from './event-type.service';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

import { Event } from '@interfaces/event';

export const mockEventsList: Event[] = APP_UTILITIES.EVENTS_DUMMY_DATA_LIST;

describe('EventTypeService', () => {
    let httpTestingController: HttpTestingController;
    let service: EventTypeService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EventTypeService],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(EventTypeService);
    });
    afterEach(() => {
        httpTestingController.verify();
        TestBed.resetTestingModule();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#fetchEventsByEventType() should retrieve an events list from the data API with requested event type', () => {
        let testEventType = 2;
        service.fetchEventsByEventType(testEventType).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results.events)).toEqual(
                JSON.stringify(mockEventsList)
            );

            let expectedEventType = true;
            for (let item of results.events) {
                if (item.event_type_id !== testEventType) {
                    expectedEventType = false;
                }
            }
            expect(expectedEventType).toBeTrue();
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.EVENT_TYPES + '/' + testEventType + '/Events.json'
        );
        req.flush(mockEventsList);
    });

    it('#getEventsByEventType returns an Observable of an events array  with requested event type', () => {
        let testEventType = 2;
        service.getEventsByEventType(testEventType).subscribe((eventType) => {
            expect(eventType).toEqual({
                event_type_id: testEventType,
                events: mockEventsList,
            });
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.EVENT_TYPES + '/' + testEventType + '/Events.json'
        );
        req.flush(mockEventsList);
    });
});
