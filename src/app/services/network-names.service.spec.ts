import { TestBed } from '@angular/core/testing';

import { NetworkNamesService } from './network-names.service';

describe('NetworkNamesService', () => {
  let service: NetworkNamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkNamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
