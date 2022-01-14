import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@app/app.settings';

import { HwmEditService } from './hwm-edit.service';

describe('HwmEditService', () => {
  let service: HwmEditService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HwmEditService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(HwmEditService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //Get HWM Type Lookup
  it('#getHWMTypeLookup() should retrieve a list of HWM types from the data API', () => {
    let mockHWMTypesList = [{
      hwm_type_id: 1,
      hwm_type: "test",
    }]
    service.getHWMTypeLookup().subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockHWMTypesList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'HWMTypes.json'

    );
    req.flush(mockHWMTypesList);
  });

   //Get HWM Marker Lookup
   it('#getHWMMarkerLookup() should retrieve a list of HWM Markers from the data API', () => {
    let mockHWMMarkersList = [{
      marker_id: 1,
      marker1: "test",
    }]
    service.getHWMMarkerLookup().subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockHWMMarkersList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Markers.json'

    );
    req.flush(mockHWMMarkersList);
  });

  //Get HWM Quality Lookup
  it('#getHWMQualityLookup() should retrieve a list of HWM Qualities from the data API', () => {
    let mockHWMQualitiesList = [{
      hwm_quality_id: 1,
      hwm_quality: "test",
    }]
    service.getHWMQualityLookup().subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockHWMQualitiesList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'HWMQualities.json'

    );
    req.flush(mockHWMQualitiesList);
  });

  //Get Approval
  it('#getApprovals() should retrieve a list of approvals from the data API', () => {
    let mockApprovalsList = [{
      approval_id: 1,
      approval_date: "2022-01-01T21:20:00.000000",
    }]
    service.getApproval(1).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockApprovalsList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Approvals/1.json'

    );
    req.flush(mockApprovalsList);
  });
});
