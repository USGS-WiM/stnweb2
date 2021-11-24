import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { SiteEditComponent } from './site-edit.component';
import { of } from 'rxjs';
import { APP_SETTINGS } from '@app/app.settings';

describe('SiteEditComponent', () => {
  let component: SiteEditComponent;
  let fixture: ComponentFixture<SiteEditComponent>;

  const dialogMock = {
    close: () => {},
  };

  const data = 
    {  
      site: {
        description: null,
        internal_notes: null,
        latitude_dd: null,
        longitude_dd: null,
        hdatum_id: null,
        hcollect_method_id: null,
        waterbody: null,
        drainage_area: null,
        usgs_id: null,
        noaa_id: null,
        other_id: null,
        safety_notes: null,
        zone: null,
        address: null,
        city: null,
        state: "AL",
        county: null,
        zip: null,
        memberName: null,
        priority_id: null,
      },
      networkType: null,
      networkName: null,
      hdatumList: null,
      hmethodList: null,
      siteFiles: null,
      siteHousing: [],
      memberName: 0,
      priority: 1,
      landowner: null,
    }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditComponent ],
      providers: [
        SiteService,
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        MatTableModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the networkTypes lookup', () => {
    const response: any[] = [{network_type_name: "test", selected: false}];

    spyOn(component.siteService, 'getNetworkTypesList').and.returnValue(
        of(response)
    );

    component.getNetworkTypes();
    fixture.detectChanges();
    expect(component.networkTypes).toEqual(response);
  });

  it('networkType should be selected and new form control added', () => {
    const response: any[] = [{network_type_name: "test"}];
    data.networkType = "test";

    spyOn(component.siteService, 'getNetworkTypesList').and.returnValue(
        of(response)
    );

    component.getNetworkTypes();
    fixture.detectChanges();
    expect(component.networkTypes).toEqual([{network_type_name: "test", selected: true}]);
    expect(component.selectedNetworkTypes.length).toEqual(1);
    expect(component.siteForm.controls.networkType.length).toEqual(1);

    data.networkType = null;
  });

  it('should set the networkNames lookup', () => {
    const response: any[] = [{name: "test"}];

    spyOn(component.siteService, 'getNetworkNamesList').and.returnValue(
        of(response)
    );

    component.getNetworkNames();
    fixture.detectChanges();
    expect(component.networkNames).toEqual([{name: "test", selected: false}]);
  });

  it('networkName should be selected and new form control added', () => {
    const response: any[] = [{name: "test"}];
    data.networkName = "test";

    spyOn(component.siteService, 'getNetworkNamesList').and.returnValue(
        of(response)
    );

    component.getNetworkNames();
    fixture.detectChanges();
    expect(component.networkNames).toEqual([{name: "test", selected: true}]);
    expect(component.selectedNetworkNames.length).toEqual(1);
    expect(component.siteForm.controls.networkName.length).toEqual(1);

    data.networkName = null;
  });

  it('if networkName is Not Defined initially, disable all other checkboxes', () => {
    const response: any[] = [{name: "Not Defined"}, {name: "test"}];
    data.networkName = "Not Defined";
    
    spyOn(component.siteService, 'getNetworkNamesList').and.returnValue(
        of(response)
    );

    component.getNetworkNames();
    fixture.detectChanges();
    expect(component.isDisabled).toBeTrue;
    expect(component.selectedNetworkNames.length).toEqual(1);
    expect(component.siteForm.controls.networkName.length).toEqual(1);
    expect(component.networkNames).toEqual([{name: "Not Defined", selected: true}, {name: "test", selected: false}])

    data.networkName = null;
  });

  it('should set the form values for checked network types', () => {
    let data = {network_type_name: "test network", selected: false};
    let event = {checked: true};
    component.selectedNetworkTypes = ["test1", "test2"];

    // checked
    component.setSelectedNetworkType(event, data);
    fixture.detectChanges();
    expect(data.selected).toEqual(true);
    expect(component.selectedNetworkTypes.length).toEqual(3);

    // unchecked
    data = {network_type_name: "test network", selected: true};
    event = {checked: false};

    component.setSelectedNetworkType(event, data);
    fixture.detectChanges();
    expect(data.selected).toEqual(false);
    expect(component.selectedNetworkTypes.length).toEqual(2);
  });

  it('should set the form values for checked network names', () => {
    let data = {name: "Not Defined", selected: false};
    component.networkNames = [{name: "Not Defined", selected: false}, {name: "test1", selected: true}, {name: "test2", selected: true}];
    let event = {checked: true};
    component.selectedNetworkNames = ["test1", "test2"];

    // checked
    component.setSelectedNetworkName(event, data);
    fixture.detectChanges();
    expect(data.selected).toEqual(true);
    expect(component.isDisabled).toBeTrue;
    expect(component.selectedNetworkNames.length).toEqual(1);
    expect(component.networkNames[0].selected).toEqual(true);
    expect(component.networkNames[1].selected).toEqual(false);
    expect(component.networkNames[2].selected).toEqual(false);

    // unchecked
    data = {name: "Not Defined", selected: true};
    event = {checked: false};

    component.setSelectedNetworkName(event, data);
    fixture.detectChanges();
    expect(data.selected).toEqual(false);
    expect(component.selectedNetworkNames.length).toEqual(0);
    expect(component.isDisabled).toBeFalse;
  });

  xit('should add or remove rows in the housing type table', () => {
    // Add values
    let value = ["test3"];

    component.changeTableValue(value);
    fixture.detectChanges();
    expect(component.siteHousingArray.length).toEqual(1);

    // Remove value
    value = ["test3"]
    component.changeTableValue(value);
    fixture.detectChanges();
    expect(component.siteHousingArray.length).toEqual(0);
  });

  it('should set the agency lookup', () => {
    const response: any[] = [{agency: "test"}];

    spyOn(component.siteService, 'getAgencyLookup').and.returnValue(
        of(response)
    );

    component.getAgencies();
    fixture.detectChanges();
    expect(component.agencies).toEqual(response);
  });

  it('should set the priority lookup', () => {
    const response: any[] = [{priority_id: 1}];
    
    spyOn(component.siteService, 'getPriorities').and.returnValue(
        of(response)
    );

    component.getPriorities();
    fixture.detectChanges();
    expect(component.priorityList).toEqual(response);
  });

  it('should set the file type lookup', () => {
    const response: any[] = [{filetype: "Photo"}];
    
    spyOn(component.siteService, 'getFileTypeLookup').and.returnValue(
        of(response)
    );

    component.getFileTypes();
    fixture.detectChanges();
    expect(component.fileTypes).toEqual(response);
  });

  it('should set the site housing lookup', () => {
    const response: any[] = [{housingType: "test"}];
    
    spyOn(component.siteService, 'getAllHousingTypes').and.returnValue(
        of(response)
    );

    component.getSiteHousings();
    fixture.detectChanges();
    expect(component.siteHousingLookup).toEqual(response);
  });

  it('should set the state lookup', () => {
    const response: any[] = [{state_name: "Alabama", state_abbrev: "AL"}];
    
    spyOn(component.siteService, 'getAllStates').and.returnValue(
        of(response)
    );

    component.getStateList();
    fixture.detectChanges();
    expect(component.stateList).toEqual(response);
    expect(component.siteForm.controls['state'].value).toEqual("Alabama");
  });

  it('should set the county lookup', () => {
    const response: any[] = ["county1", "county2"];
    component.stateList = [{state_name: "Alabama", state_id: 1}, {state_name: "Idaho", state_id: 2}];
    
    spyOn(component.siteService, 'getAllCounties').and.returnValue(
        of(response)
    );

    component.getCountyList("Alabama");
    fixture.detectChanges();
    expect(component.countyList).toEqual(response);
  });

  it('should add landowner contact', () => {
    component.addLandownerContact();
    fixture.detectChanges();
    expect(component.addLandownerCheck).toBeTrue;
  });

  it('should set LO address to site address', () => {
    component.useSiteAddress = false;
    component.site.address = "000 Test Street";
    component.site.city = "Test City";
    component.site.state = "Alabama";
    component.site.zip = "00000";

    component.useAddressforLO();
    fixture.detectChanges();
    expect(component.landownerForm.dirty).toBeTrue;
    expect(component.useSiteAddress).toBeTrue;
    expect(component.landownerContact.address).toEqual("000 Test Street");
    expect(component.landownerContact.city).toEqual("Test City");
    expect(component.landownerContact.state).toEqual("Alabama");
    expect(component.landownerContact.zip).toEqual("00000");
    expect(component.landownerForm.controls['address'].value).toEqual("000 Test Street");
    expect(component.landownerForm.controls['city'].value).toEqual("Test City");
    expect(component.landownerForm.controls['state'].value).toEqual("Alabama");
    expect(component.landownerForm.controls['zip'].value).toEqual("00000");
  });

  it('should remove site address from LO address', () => {
    component.useSiteAddress = true;
    component.site.address = "000 Test Street";
    component.site.city = "Test City";
    component.site.state = "Alabama";
    component.site.zip = "00000";

    component.useAddressforLO();
    fixture.detectChanges();
    expect(component.landownerForm.dirty).toBeTrue;
    expect(component.useSiteAddress).toBeFalse;
    expect(component.landownerContact.address).toEqual("");
    expect(component.landownerContact.city).toEqual("");
    expect(component.landownerContact.state).toEqual("");
    expect(component.landownerContact.zip).toEqual("");
    expect(component.landownerForm.controls['address'].value).toEqual("");
    expect(component.landownerForm.controls['city'].value).toEqual("");
    expect(component.landownerForm.controls['state'].value).toEqual("");
    expect(component.landownerForm.controls['zip'].value).toEqual("");
  });

  it('should format date', () => {
    const testDate = {value: new Date("November 20, 2021 11:00:00")};

    component.formatDate(testDate);
    fixture.detectChanges();
    expect(component.formattedPhotoDate).toEqual("11/20/2021");
  });

  it('should convert dd to dms', () => {
    let lat = 45.86;

    let dmsLat = component.deg_to_dms(lat);
    fixture.detectChanges();
    expect(dmsLat).toEqual("45:51:36.000");

    let lon = -91.86;

    let dmsLon = component.deg_to_dms(lon);
    fixture.detectChanges();
    expect(dmsLon).toEqual("91:51:36.000");
  });

  it('should convert dms to dd', () => {
    let deg = 45;
    let min = 51;
    let sec = 36.000;

    let latDMS = component.azimuth(deg, min, sec);
    fixture.detectChanges();
    expect(latDMS).toEqual("45.86000");

    deg = -91;
    min = 51;
    sec = 36.000;

    let lonDMS = component.azimuth(deg, min, sec);
    fixture.detectChanges();
    expect(lonDMS).toEqual("-91.86000");
  });

  it('should set the agency name for the preview caption', () => {
    component.siteFileForm.controls["filetype_id"].value = 1;
    component.siteFileForm.controls["agency_id"].value = 0;
    component.agencies = [{agency_name: "WIM", agency_id: 0}];
    component.updateAgencyForCaption();
    fixture.detectChanges();
    expect(component.agencyNameForCap).toEqual("WIM");
  });

  it('sensor not appropriate should disable permanent housing installed and set value to No', () => {
    let event = {checked: true};
    component.sensorAppropriateChanged(event);
    fixture.detectChanges();
    expect(component.perm_housing_installed).toEqual("No");
    expect(component.siteForm.controls['is_permanent_housing_installed'].value).toEqual("No");
    expect(component.siteForm.controls['is_permanent_housing_installed'].disabled).toEqual(true);

    // should enable permanent housing when unchecked
    event = {checked: false};
    component.sensorAppropriateChanged(event);
    fixture.detectChanges();
    expect(component.siteForm.controls['is_permanent_housing_installed'].disabled).toEqual(false);
  });

  it('should reset and show file edit form', () => {
    let row = {filetype_id: 1, file_id: 1, source_id: 1, file_date: new Date(), photo_date: new Date(), photo_direction: "", latitude_dd: 45.86, longitude_dd: -87.60, name: "filename.jpg"};
    let cancelFileSpy = spyOn(component, 'cancelFile');
    let setInitFile = spyOn(component, 'setInitFileEditForm');
    let getFileSpy = spyOn(component, 'getFile');

    component.showFileEdit(row);
    fixture.detectChanges();
    expect(cancelFileSpy).toHaveBeenCalled;
    expect(setInitFile).toHaveBeenCalled;
    expect(component.addFileType).toEqual("Existing");
    expect(getFileSpy).toHaveBeenCalled;
    expect(component.siteFiles.source_id).toEqual(1);
    expect(component.siteFiles.file_id).toEqual(1);
    expect(component.siteFiles.filetype_id).toEqual(1);
    expect(component.siteFiles.file_date).toEqual(row.file_date);
    expect(component.siteFiles.photo_date).toEqual(row.photo_date);
    expect(component.siteFiles.photo_direction).toEqual(null);
    expect(component.siteFiles.latitude_dd).toEqual(45.86);
    expect(component.siteFiles.longitude_dd).toEqual(-87.60);
  });

  it('set initial file edit form control values', () => {
    let data = {filetype_id: 1, file_id: 1, source_id: 1, file_date: new Date(), photo_date: new Date(), photo_direction: "", latitude_dd: 45.86, longitude_dd: -87.60, name: "filename.jpg"};

    component.setInitFileEditForm(data);
    fixture.detectChanges();
    expect(component.siteFileForm.controls.source_id.value).toEqual(1);
    expect(component.siteFileForm.controls.file_id.value).toEqual(1);
    expect(component.siteFileForm.controls.filetype_id.value).toEqual(1);
    expect(component.siteFileForm.controls.file_date.value).toEqual(data.file_date);
    expect(component.siteFileForm.controls.photo_date.value).toEqual(data.photo_date);
    expect(component.siteFileForm.controls.photo_direction.value).toEqual("");
    expect(component.siteFileForm.controls.latitude_dd.value).toEqual(45.86);
    expect(component.siteFileForm.controls.longitude_dd.value).toEqual(-87.60);
  });

  it('should get the file item name', () => {
    component.siteFiles.file_id = 1;
    const response = {FileName: "testFile"};
    
    spyOn(component.siteService, 'getFileItem').and.returnValue(
        of(response)
    );

    let fileAgencySpy = spyOn(component, 'setFileSourceAgency');
    let fileSourceSpy = spyOn(component, 'setFileSource');

    component.getFile();
    fixture.detectChanges();
    expect(component.fileItemExists).toEqual(true);
    expect(component.fileSource).toEqual(APP_SETTINGS.API_ROOT + 'Files/1/item')
    expect(component.siteFiles.name).toEqual("testFile");
    expect(component.siteFileForm.controls.name.value).toEqual("testFile");
    expect(fileAgencySpy).toHaveBeenCalled;
    expect(fileSourceSpy).toHaveBeenCalled;
  });

  it('should set the file source agency', () => {
    component.siteFiles.source_id = 1;
    const response = {agency_name: "WIM", agency_id: 0};
    
    spyOn(component.siteService, 'getFileSource').and.returnValue(
        of(response)
    );

    component.setFileSourceAgency();
    fixture.detectChanges();
    expect(component.agencyNameForCap).toEqual("WIM");
    expect(component.siteFiles.agency_id).toEqual(0);
    expect(component.siteFileForm.controls.agency_id.value).toEqual(0);
  });

  it('should set the file source', () => {
    component.siteFiles.source_id = 1;
    const response = {source_name: "John Smith"};
    
    spyOn(component.siteService, 'getSourceName').and.returnValue(
        of(response)
    );

    component.setFileSource();
    fixture.detectChanges();
    expect(component.siteFiles.FULLname).toEqual("John Smith");
    expect(component.siteFileForm.controls.FULLname.value).toEqual("John Smith");
  });

});
