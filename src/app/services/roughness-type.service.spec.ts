import { TestBed } from '@angular/core/testing';

import { RoughnessTypeService } from './roughness-type.service';

describe('RoughnessTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RoughnessTypeService = TestBed.get(RoughnessTypeService);
    expect(service).toBeTruthy();
  });
});
