import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';

import { StreamgageService } from './streamgage.service';
import { defer } from 'rxjs';
import { APP_UTILITIES } from '@app/app.utilities';

export function responseData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('StreamgageService', () => {
  let service: StreamgageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StreamgageService, HttpClient],
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(StreamgageService);
  });
  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getStreamGages() should retrieve a stream gage list from the data API', () => {
    const bbox = "-90.8074951,29.5113300,-88.6047363,31.1187944";
    const domParser = new DOMParser();
    let parameterCodeList = "00065,63160,72214";
    let siteTypeList = "OC,OC-CO,ES,LK,ST,ST-CA,ST-DCH,ST-TS";
    let siteStatus = "active";
    service.getStreamGages(bbox).subscribe((results) => {
        const xmlElement = domParser.parseFromString(results, 'text/xml');
        results = xmlElement.getElementsByTagName('site');
        expect(results).not.toBe(null);
        expect((results)).toBe(HTMLCollection);
    });
    const req = httpTestingController.expectOne(
      "https://waterservices.usgs.gov/nwis/site/?format=mapper&bBox=" + bbox + "&parameterCd=" +
      parameterCodeList +
      "&siteType=" +
      siteTypeList +
      "&siteStatus=" +
      siteStatus
    );
  });

  it('#getSingleGage() should retrieve a stream gage list from the data API', () => {
    const domParser = new DOMParser();
    let siteCode = "07381355";
    let timeQueryRange = "&startDT=2020-10-06&endDT=2020-10-13";
    let parameterCodeList = "00065,63160,72279";
    service.getSingleGage(siteCode, timeQueryRange).subscribe((results) => {
        const xmlElement = domParser.parseFromString(results, 'text/xml');
        results = xmlElement.getElementsByTagName('site');
        expect(results).not.toBe(null);
        expect((results)).toBe(HTMLCollection);
    });
    const req = httpTestingController.expectOne(
      "https://nwis.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=" +
          siteCode +
          "&parameterCd=" +
          parameterCodeList +
          timeQueryRange
    );
  });
});
