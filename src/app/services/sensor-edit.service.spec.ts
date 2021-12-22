import { TestBed } from '@angular/core/testing';

import { SensorEditService } from './sensor-edit.service';

describe('SensorEditService', () => {
  let service: SensorEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensorEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
