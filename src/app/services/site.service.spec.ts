import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Site } from '@interfaces/site';
import { SiteService } from './site.service';
import { of, defer } from 'rxjs';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

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

    /// Tests begin ///
    it('should be created', () => {
        expect(service).toBeTruthy();
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
