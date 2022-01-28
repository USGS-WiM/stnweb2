import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PeakEditService } from './peak-edit.service';
import { APP_SETTINGS } from '@app/app.settings';

describe('PeakEditService', () => {
  let service: PeakEditService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PeakEditService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getPeakSummary() should retrieve a peak summary', () => {
    let mockPeakSummary = {
      peak_summary_id: 0,
    }
    service.getPeakSummary(0).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockPeakSummary)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'PeakSummaries/0.json'

    );
    req.flush(mockPeakSummary);
  });

  it('#getPeakDataFiles() should retrieve data files for a peak', () => {
    let mockPeakDFList = [{data_file_id: 0}, {data_file_id: 1}]
    service.getPeakDataFiles(0).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockPeakDFList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'PeakSummaries/0/DataFiles.json'

    );
    req.flush(mockPeakDFList);
  });

  it('#putPeak() should update a peak', () => {
    let mockPeak = {
      peak_summary_id: 0,
    }
    service.putPeak(0, mockPeak).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockPeak)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'PeakSummaries/0.json'

    );
    req.flush(mockPeak);
  });

  it('#updateDF() should update a peak', () => {
    let mockDF = {
      data_file_id: 0,
    }
    service.updateDF(0, mockDF).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockDF)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'DataFiles/0.json'

    );
    req.flush(mockDF);
  });

  it('#updateHWM() should update a peak', () => {
    let mockHWM = {
      hwm_id: 0,
    }
    service.updateHWM(0, mockHWM).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockHWM)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'hwms/0.json'

    );
    req.flush(mockHWM);
  });
});
