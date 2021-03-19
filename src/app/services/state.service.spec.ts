import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { State } from '@interfaces/state';
import { StateService } from './state.service';

import { of, defer } from 'rxjs';

import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

export const mockStatesList: State[] = APP_UTILITIES.STATES_DUMMY_DATA_LIST;
export const mockState: State = APP_UTILITIES.DUMMY_STATE;

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

describe('StateService', () => {
    let httpTestingController: HttpTestingController;
    let service: StateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [StateService],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(StateService);
    });
    afterEach(() => {
        httpTestingController.verify();
        TestBed.resetTestingModule();
    });

    /// Tests begin ///
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#getStates() should retrieve a states list from the data API', () => {
        service.getStates().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockStatesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.STATES + '.json'
        );
        req.flush(mockStatesList);
    });

    it('#getState() should retrieve a single state record from the data API', () => {
        service.getState(13).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(JSON.stringify(mockState));
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.STATES + 13 + '.json'
        );
        req.flush(mockState);
    });
});
