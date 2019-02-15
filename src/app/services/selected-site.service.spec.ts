import { TestBed } from '@angular/core/testing';

import { SelectedSiteService } from './selected-site.service';

describe('SelectedSiteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SelectedSiteService = TestBed.get(SelectedSiteService);
    expect(service).toBeTruthy();
  });
});
