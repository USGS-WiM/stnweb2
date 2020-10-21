import { TestBed } from '@angular/core/testing';

import { WeatherConditionTypeService } from './weather-condition-type.service';

describe('WeatherConditionTypeService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: WeatherConditionTypeService = TestBed.get(
            WeatherConditionTypeService
        );
        expect(service).toBeTruthy();
    });
});
