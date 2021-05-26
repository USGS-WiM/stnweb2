import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@app/app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { of, defer } from 'rxjs';
import { Site } from '@app/interfaces/site';

import { SiteService } from './site.service';

export const mockSitesList: Site[] = APP_UTILITIES.SITES_DUMMY_DATA_LIST;

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

describe('SiteService', () => {
    let httpTestingController: HttpTestingController;
    let service: SiteService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SiteService, HttpClient],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(SiteService);
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
                JSON.stringify(mockSitesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.EVENTS + '/' + 7 + '/Sites.json'
        );
        req.flush(mockSitesList);
    });

    it('#getFilteredSites() should retrieve a list of sites based on input query params', () => {
        service
            .getFilteredSites(APP_UTILITIES.FILTERED_SITES_SAMPLE_QUERY_PARAMS)
            .subscribe((results) => {
                expect(results).not.toBe(null);
                expect(JSON.stringify(results)).toEqual(
                    JSON.stringify(mockSitesList)
                );
            });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL +
                '/FilteredSites.json?' +
                APP_UTILITIES.FILTERED_SITES_SAMPLE_QUERY_PARAMS
        );
        req.flush(mockSitesList);
    });

    it('#getAllSites() should retrieve a sites list from the data API', () => {
        service.getAllSites().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSitesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '.json'
        );
        req.flush(mockSitesList);
    });
});
