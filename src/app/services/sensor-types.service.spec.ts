import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SensorType } from '@interfaces/sensor-type';
import { SensorTypesService } from './sensor-types.service';
import { of, defer } from 'rxjs';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

export const mockSensorTypesList: SensorType[] =
    APP_UTILITIES.SENSOR_TYPES_DUMMY_DATA_LIST;
export const mockSensorType: SensorType = APP_UTILITIES.DUMMY_SENSOR_TYPE;

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

describe('SensorTypesService', () => {
    let httpTestingController: HttpTestingController;
    let service: SensorTypesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SensorTypesService, HttpClient],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(SensorTypesService);
    });
    afterEach(() => {
        httpTestingController.verify();
        TestBed.resetTestingModule();
    });

    /// Tests begin ///
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#getSensorTypes() should retrieve a sensor types list from the data API', () => {
        service.getSensorTypes().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSensorTypesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SENSOR_TYPES + '.json'
        );
        req.flush(mockSensorTypesList);
    });

    it('#getSensorType() should retrieve a single sensor type record from the data API', () => {
        service.getSensorType(4).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSensorType)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SENSOR_TYPES + 4 + '.json'
        );
        req.flush(mockSensorType);
    });
});
