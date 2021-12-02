import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AgencyService } from './agency.service';

describe('AgencyService', () => {
  let service: AgencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [HttpClient, HttpHandler ],
    });
    service = TestBed.inject(AgencyService);
});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
