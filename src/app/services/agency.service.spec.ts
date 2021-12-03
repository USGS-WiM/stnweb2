import { TestBed } from '@angular/core/testing';
import { defer } from 'rxjs';
import { AgencyService } from './agency.service';
import { Agency } from '@interfaces/agency';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

export function responseData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export const mockAgencyList: Agency[] = APP_UTILITIES.AGENCY_DUMMY_DATA_LIST;

describe('RoleService', () => {
  let httpTestingController: HttpTestingController;
  let service: AgencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgencyService],
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AgencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getAllAgencies() should retrieve an agency list from the data API', () => {
    service.getAllAgencies().subscribe((results) => {
      expect(results).not.toBe(null);
      expect(JSON.stringify(results)).toEqual(
        JSON.stringify(mockAgencyList)
      );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.AGENCIES + '.json'
    );
    req.flush(mockAgencyList);
  });

  it('#getAnAgency() should retrieve an agency from the data API', () => {
    service.getAnAgency("2").subscribe((results) => {
      expect(results).not.toBe(null);
      expect(JSON.stringify(results)).toEqual(
        JSON.stringify(mockAgencyList)
      );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.AGENCIES + '/' + 2 + '.json'
    );
    req.flush(mockAgencyList);
  });
});
