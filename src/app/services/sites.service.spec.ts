import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@app/app.settings';
import { APP_UTILITIES } from '@app/app.utilities';

import { Site } from '@app/interfaces/site';

import { SitesService } from './sites.service';

export const mockSiteList: Site[] = APP_UTILITIES.SITES_DUMMY_DATA_LIST;

describe('SitesService', () => {
    let httpTestingController: HttpTestingController;
    let service: SitesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SitesService, HttpClient],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(SitesService);
    });
    afterEach(() => {
        httpTestingController.verify();
        TestBed.resetTestingModule();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#getEventSites() should retrieve a list of Event sites from the API', () => {
        service.getEventSites(7).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSiteList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.EVENTS + '/' + 7 + '/Sites.json'
        );
        req.flush(mockSiteList);
    });
});
