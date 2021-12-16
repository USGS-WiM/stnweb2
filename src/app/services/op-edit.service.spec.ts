import { TestBed } from '@angular/core/testing';

import { OpEditService } from './op-edit.service';

describe('OpEditService', () => {
  let service: OpEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
