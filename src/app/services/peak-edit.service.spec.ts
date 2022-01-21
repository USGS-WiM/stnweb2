import { TestBed } from '@angular/core/testing';

import { PeakEditService } from './peak-edit.service';

describe('PeakEditService', () => {
  let service: PeakEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeakEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
