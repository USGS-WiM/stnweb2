import { TestBed } from '@angular/core/testing';

import { StageTypeService } from './stage-type.service';

describe('StageTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StageTypeService = TestBed.get(StageTypeService);
    expect(service).toBeTruthy();
  });
});
