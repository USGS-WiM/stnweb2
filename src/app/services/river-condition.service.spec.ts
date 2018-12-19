import { TestBed } from '@angular/core/testing';

import { RiverConditionService } from './river-condition.service';

describe('RiverConditionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RiverConditionService = TestBed.get(RiverConditionService);
    expect(service).toBeTruthy();
  });
});
