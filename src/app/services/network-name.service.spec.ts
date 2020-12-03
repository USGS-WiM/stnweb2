import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NetworkName } from '@interfaces/network-name';
import { NetworkNameService } from './network-name.service';

import { of, defer } from 'rxjs';

import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

export const mockNetworkNamesList: NetworkName[] =
    APP_UTILITIES.NETWORK_NAMES_DUMMY_DATA_LIST;
export const mockNetworkName: NetworkName = APP_UTILITIES.DUMMY_NETWORK_NAME;

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

describe('NetworkNameService', () => {
    let httpTestingController: HttpTestingController;
    let service: NetworkNameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NetworkNameService, HttpClient],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(NetworkNameService);
    });
    afterEach(() => {
        httpTestingController.verify();
        TestBed.resetTestingModule();
    });

    /// Tests begin ///
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#getNetworkNames() should retrieve a network names list from the data API', () => {
        service.getNetworkNames().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockNetworkNamesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.NETWORK_NAMES + '.json'
        );
        req.flush(mockNetworkNamesList);
    });

    it('#getNetworkName() should retrieve a network name record from the data API', () => {
        service.getNetworkName(5).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockNetworkName)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.NETWORK_NAMES + 5 + '.json'
        );
        req.flush(mockNetworkName);
    });
});
