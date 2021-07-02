import { TestBed } from '@angular/core/testing';

import { StreamgageService } from './streamgage.service';

describe('StreamgageService', () => {
  let service: StreamgageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamgageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
