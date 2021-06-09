import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@app/app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { of, defer } from 'rxjs';
import { NoaaStation } from '@interfaces/noaa-station';

import { NoaaService } from './noaa.service';

export const mockStationList: NoaaStation = APP_UTILITIES.NOAA_DUMMY_DATA_LIST; 

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

describe('NoaaService', () => {
  let httpTestingController: HttpTestingController;
  let service: NoaaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoaaService, HttpClient],
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(NoaaService);
  });
  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getTides() should retrieve a station list from the data API', () => {
    service.getTides().subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockStationList)
        );
    });
    const req = httpTestingController.expectOne(
      'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json'
    );
    req.flush(mockStationList);
  });
});
