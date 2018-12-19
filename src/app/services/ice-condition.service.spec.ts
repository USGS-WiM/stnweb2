import { TestBed } from '@angular/core/testing';

import { IceConditionService } from './ice-condition.service';

describe('IceConditionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IceConditionService = TestBed.get(IceConditionService);
    expect(service).toBeTruthy();
  });
});
