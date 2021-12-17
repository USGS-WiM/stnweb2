import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@app/app.settings';

import { OpEditService } from './op-edit.service';

describe('OpEditService', () => {
  let service: OpEditService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpEditService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(OpEditService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#putReferenceDatum() should update a reference datum', () => {
    let mockRD = 
        {
            objective_point_id: 0,
        }

    service.putReferenceDatum('0', mockRD).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockRD)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'ObjectivePoints/0.json',
    );
    req.flush(mockRD);
  });

  it('#postControlID() should add a control identifier', () => {
    let mockControlID = 
        {
            op_control_identifer_id: 0,
        }

    service.postControlID(mockControlID).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockControlID)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'OPControlIdentifiers.json',
    );
    req.flush(mockControlID);
  });

  it('#updateControlID() should update a control identifier', () => {
    let mockControlID = 
        {
            op_control_identifer_id: 0,
        }

    service.updateControlID('0', mockControlID).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockControlID)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'OPControlIdentifiers/0.json',
    );
    req.flush(mockControlID);
  });

  it('#deleteControlID() should delete a control identifier', () => {
    service.deleteControlID('0').subscribe((results) => {
        expect(results).toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(null)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'OPControlIdentifiers/0.json',
    );
    req.flush(null);
  });
});
