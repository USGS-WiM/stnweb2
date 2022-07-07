import { TestBed } from '@angular/core/testing';

import { SiteEditService } from './site-edit.service';
import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { APP_SETTINGS } from '@app/app.settings';

describe('SiteEditService', () => {
  let service: SiteEditService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SiteEditService, HttpClient],
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SiteEditService);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#putSite() should update single site', () => {
      let mockSite = 
          {
              site_id: 24224,
          }

      service.putSite('24224', mockSite).subscribe((results) => {
          expect(results).not.toBe(null);
          expect(JSON.stringify(results)).toEqual(
              JSON.stringify(mockSite)
          );
      });
      const req = httpTestingController.expectOne(
        APP_SETTINGS.SITES_URL + '/24224.json',
      );
      req.flush(mockSite);
  });

  it('#putLandowner() should update a site landowner contact', () => {
    let mockLandowner = 
        {
            site_id: 24224,
            landownercontact_id: 9999,
        }

    service.putLandowner(mockLandowner.landownercontact_id, mockLandowner).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockLandowner)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'LandOwners/9999.json',
    );
    req.flush(mockLandowner);
  });

  it('#postLandowner() should create a new landowner', () => {
    let mockLandowner = 
        {
            site_id: 24224,
            fname: "test"
        }

    service.postLandowner(mockLandowner).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockLandowner)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'LandOwners.json',
    );
    req.flush(mockLandowner);
  });

  it('#postNetworkNames() should add a network name to a site', () => {
    let mockNetworkName = 
        {
            network_name_id: 1,
        }

    service.postNetworkNames('24224', mockNetworkName.network_name_id).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockNetworkName)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'sites/24224/AddNetworkName?NetworkNameId=1',
    );
    req.flush(mockNetworkName);
  });

  it('#deleteNetworkNames() should remove a network name from a site', () => {
    let mockNetworkName = [];

    service.deleteNetworkNames('24224', 1).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockNetworkName)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.SITES_URL + '/24224/removeNetworkName?NetworkNameId=1',
    );
    req.flush(mockNetworkName);
  });

  it('#postNetworkTypes() should add a network type to a site', () => {
    let mockNetworkType = 
        {
            network_type_id: 1,
        }

    service.postNetworkTypes('24224', mockNetworkType.network_type_id).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockNetworkType)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'sites/24224/AddNetworkType?NetworkTypeId=1',
    );
    req.flush(mockNetworkType);
  });

  it('#deleteNetworkTypes() should remove a network type from a site', () => {
    let mockNetworkType = [];

    service.deleteNetworkTypes('24224', 1).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockNetworkType)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'sites/24224/removeNetworkType?NetworkTypeId=1'
    );
    req.flush(mockNetworkType);
  });

  it('#deleteSiteHousings() should remove a site housing from a site', () => {
    let mockSiteHousing = [];

    service.deleteSiteHousings('10').subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockSiteHousing)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'SiteHousings/10.json',
    );
    req.flush(mockSiteHousing);
  });

  it('#postSiteHousings() should add a site housing to a site', () => {
    let mockSiteHousing = 
        {
            housing_type_id: 10,
            site_id: 24224,
        }

    service.postSiteHousings(mockSiteHousing).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockSiteHousing)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'SiteHousings.json',
    );
    req.flush(mockSiteHousing);
  });

  it('#putSiteHousings() should edit a site housing for a site', () => {
    let mockSiteHousing = 
        {
            housing_type_id: 10,
            site_id: 24224,
            amount: 1,
        }

    service.putSiteHousings(mockSiteHousing.housing_type_id, mockSiteHousing).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockSiteHousing)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'SiteHousings/10.json',
    );
    req.flush(mockSiteHousing);
  });

  it('#postSource() should add a source or return an existing source', () => {
    let mockSource = 
        {
            source_id: 9999,
            source_name: "test"
        }

    service.postSource(mockSource).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockSource)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Sources.json',
    );
    req.flush(mockSource);
  });

  it('#uploadFile() should add a new file', () => {
    let mockFile = 
        {
            filetype_id: 1,
            name: "test file"
        }

    service.uploadFile(mockFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files/bytes',
    );
    req.flush(mockFile);
  });

  it('#saveFile() should create a new link file', () => {
    let mockFile = 
        {
            filetype_id: 1,
            name: "test file"
        }

    service.saveFile(mockFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files.json',
    );
    req.flush(mockFile);
  });
  
  it('#updateFile() should add edit or add file attributes to an existing file', () => {
    let mockFile = 
        {
            file_id: 9999,
            filetype_id: 1,
            name: "test"
        }

    service.updateFile(mockFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files/9999.json',
    );
    req.flush(mockFile);
  });

  it('#deleteFile() should remove a file', () => {
    let mockFile = [];

    service.deleteFile(9999).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files/9999.json',
    );
    req.flush(mockFile);
  });

});
