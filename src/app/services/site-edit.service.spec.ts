import { TestBed } from '@angular/core/testing';

import { SiteEditService } from './site-edit.service';

describe('SiteEditService', () => {
  let service: SiteEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
