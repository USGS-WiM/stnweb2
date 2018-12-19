import { TestBed } from '@angular/core/testing';

import { WeatherConditionService } from './weather-condition.service';

describe('WeatherConditionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WeatherConditionService = TestBed.get(WeatherConditionService);
    expect(service).toBeTruthy();
  });
});
