import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { SensorService } from './sensor.service';

import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

describe('SensorService', () => {
    let httpTestingController: HttpTestingController;
    let service: SensorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(SensorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
