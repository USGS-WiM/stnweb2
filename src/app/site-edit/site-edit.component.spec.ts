import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import { SiteEditComponent } from './site-edit.component';
import { of } from 'rxjs';
import { APP_SETTINGS } from '@app/app.settings';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { normalizeTickInterval } from 'highcharts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
        MatSnackBarModule,
        NoopAnimationsModule
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
    expect(component.siteForm.get('networkType').length).toEqual(1);

    data.networkType = null;
  });

  it('should set the networkNames lookup', () => {
    const response: any[] = [{name: "test"}];
    component.data.networkName = null;

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
    expect(component.siteForm.get('networkName').length).toEqual(1);

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
    expect(component.isDisabled).toBeTrue();
    expect(component.selectedNetworkNames.length).toEqual(1);
    expect(component.siteForm.get('networkName').length).toEqual(1);
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
    expect(component.isDisabled).toBeTrue();
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
    expect(component.isDisabled).toBeFalse();
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
    expect(component.siteForm.get('state').value).toEqual("AL");
  });

  it('should set the county lookup', () => {
    const response: any[] = ["county1", "county2"];
    component.stateList = [{state_name: "Alabama", state_id: 1, state_abbrev: "AL"}, {state_name: "Idaho", state_id: 2, state_abbrev: "ID"}];
    
    spyOn(component.siteService, 'getAllCounties').and.returnValue(
        of(response)
    );

    component.getCountyList("AL");
    fixture.detectChanges();
    expect(component.countyList).toEqual(response);
  });

  it('should add landowner contact', () => {
    component.addLandownerContact();
    fixture.detectChanges();
    expect(component.addLandownerCheck).toBeTrue();
  });

  it('should set LO address to site address', () => {
    component.useSiteAddress = false;
    component.site.address = "000 Test Street";
    component.site.city = "Test City";
    component.site.state = "Alabama";
    component.site.zip = "00000";

    component.useAddressforLO();
    fixture.detectChanges();
    expect(component.landownerForm.dirty).toBeTrue();
    expect(component.useSiteAddress).toBeTrue();
    expect(component.landownerContact.address).toEqual("000 Test Street");
    expect(component.landownerContact.city).toEqual("Test City");
    expect(component.landownerContact.state).toEqual("Alabama");
    expect(component.landownerContact.zip).toEqual("00000");
    expect(component.landownerForm.get('address').value).toEqual("000 Test Street");
    expect(component.landownerForm.get('city').value).toEqual("Test City");
    expect(component.landownerForm.get('state').value).toEqual("Alabama");
    expect(component.landownerForm.get('zip').value).toEqual("00000");
  });

  it('should remove site address from LO address', () => {
    component.useSiteAddress = true;
    component.site.address = "000 Test Street";
    component.site.city = "Test City";
    component.site.state = "Alabama";
    component.site.zip = "00000";

    component.useAddressforLO();
    fixture.detectChanges();
    expect(component.landownerForm.dirty).toBeTrue();
    expect(component.useSiteAddress).toBeFalse();
    expect(component.landownerContact.address).toEqual("");
    expect(component.landownerContact.city).toEqual("");
    expect(component.landownerContact.state).toEqual("");
    expect(component.landownerContact.zip).toEqual("");
    expect(component.landownerForm.get('address').value).toEqual("");
    expect(component.landownerForm.get('city').value).toEqual("");
    expect(component.landownerForm.get('state').value).toEqual("");
    expect(component.landownerForm.get('zip').value).toEqual("");
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
    component.siteFileForm.get("filetype_id").value = 1;
    component.siteFileForm.get("agency_id").value = 0;
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
    expect(component.siteForm.get('is_permanent_housing_installed').value).toEqual("No");
    expect(component.siteForm.get('is_permanent_housing_installed').disabled).toEqual(true);

    // should enable permanent housing when unchecked
    event = {checked: false};
    component.sensorAppropriateChanged(event);
    fixture.detectChanges();
    expect(component.siteForm.get('is_permanent_housing_installed').disabled).toEqual(false);
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
    expect(component.siteFiles.FileEntity.source_id).toEqual(1);
    expect(component.siteFiles.FileEntity.file_id).toEqual(1);
    expect(component.siteFiles.FileEntity.filetype_id).toEqual(1);
    expect(component.siteFiles.FileEntity.file_date).toEqual(row.file_date);
    expect(component.siteFiles.FileEntity.photo_date).toEqual(row.photo_date);
    expect(component.siteFiles.FileEntity.photo_direction).toEqual(null);
    expect(component.siteFiles.FileEntity.latitude_dd).toEqual(45.86);
    expect(component.siteFiles.FileEntity.longitude_dd).toEqual(-87.60);
  });

  it('set initial file edit form control values', () => {
    let data = {filetype_id: 1, file_id: 1, source_id: 1, file_date: new Date(), photo_date: new Date(), photo_direction: "", latitude_dd: 45.86, longitude_dd: -87.60, name: "filename.jpg"};

    component.setInitFileEditForm(data);
    fixture.detectChanges();
    expect(component.siteFileForm.get('source_id').value).toEqual(1);
    expect(component.siteFileForm.get('file_id').value).toEqual(1);
    expect(component.siteFileForm.get('filetype_id').value).toEqual(1);
    expect(component.siteFileForm.get('file_date').value).toEqual(data.file_date);
    expect(component.siteFileForm.get('photo_date').value).toEqual(data.photo_date);
    expect(component.siteFileForm.get('photo_direction').value).toEqual("");
    expect(component.siteFileForm.get('latitude_dd').value).toEqual(45.86);
    expect(component.siteFileForm.get('longitude_dd').value).toEqual(-87.60);
  });

  it('should get the file item name', () => {
    component.siteFiles.FileEntity.file_id = 1;
    const response = {FileName: "testFile", Length : 1};
    
    spyOn(component.siteService, 'getFileItem').and.returnValue(
        of(response)
    );

    let fileAgencySpy = spyOn(component, 'setFileSourceAgency');
    let fileSourceSpy = spyOn(component, 'setFileSource');

    component.getFile();
    fixture.detectChanges();
    expect(component.fileItemExists).toEqual(true);
    expect(component.fileSource).toEqual(APP_SETTINGS.API_ROOT + 'Files/1/item')
    expect(component.siteFiles.FileEntity.name).toEqual("testFile");
    expect(component.siteFileForm.get('name').value).toEqual("testFile");
    expect(fileAgencySpy).toHaveBeenCalled;
    expect(fileSourceSpy).toHaveBeenCalled;
  });

  it('should set the file source agency', () => {
    component.siteFiles.FileEntity.source_id = 1;
    const response = {agency_name: "WIM", agency_id: 0};
    
    spyOn(component.siteService, 'getFileSource').and.returnValue(
        of(response)
    );

    component.setFileSourceAgency();
    fixture.detectChanges();
    expect(component.agencyNameForCap).toEqual("WIM");
    expect(component.siteFiles.FileEntity.agency_id).toEqual(0);
    expect(component.siteFileForm.get('agency_id').value).toEqual(0);
  });

  it('should set the file source', () => {
    component.siteFiles.FileEntity.source_id = 1;
    const response = {source_name: "John Smith"};
    
    spyOn(component.siteService, 'getSourceName').and.returnValue(
        of(response)
    );

    component.setFileSource();
    fixture.detectChanges();
    expect(component.siteFiles.FileEntity.FULLname).toEqual("John Smith");
    expect(component.siteFileForm.get('FULLname').value).toEqual("John Smith");
  });

  it('should change lat/lng unit', () => {
    let event = {value: "decdeg"};
    component.siteForm.get("latdeg").setValue(47);
    component.siteForm.get("latmin").setValue(26);
    component.siteForm.get("latsec").setValue(30.012);
    component.siteForm.get("londeg").setValue(-91);
    component.siteForm.get("lonmin").setValue(44);
    component.siteForm.get("lonsec").setValue(30.012);

    component.changeLatLngUnit(event);
    fixture.detectChanges();
    expect(component.siteForm.get('latitude_dd').value).toEqual('47.44167');
    expect(component.siteForm.get('longitude_dd').value).toEqual('-91.74167');
    expect(component.incorrectDMS).toBeFalse();

    event = {value: "decdeg"};
    component.siteForm.get("latdeg").setValue(undefined);
    component.siteForm.get("latmin").setValue(26);
    component.siteForm.get("latsec").setValue(30.012);
    component.siteForm.get("londeg").setValue(undefined);
    component.siteForm.get("lonmin").setValue(44);
    component.siteForm.get("lonsec").setValue(30.012);
    // clear lat/lng values before function is executed again
    component.siteForm.get("latitude_dd").setValue(null);
    component.siteForm.get("longitude_dd").setValue(null);

    component.changeLatLngUnit(event);
    fixture.detectChanges();
    expect(component.siteForm.get('latitude_dd').value).toEqual(null);
    expect(component.siteForm.get('longitude_dd').value).toEqual(null);
    expect(component.incorrectDMS).toBeTrue();

    event = {value: "dms"}
    component.siteForm.get("latitude_dd").setValue(47.44167);
    component.siteForm.get("longitude_dd").setValue(-91.74167);

    component.changeLatLngUnit(event);
    fixture.detectChanges();
    expect(component.siteForm.get('latdeg').value).toEqual('47');
    expect(component.siteForm.get('latmin').value).toEqual('26');
    expect(component.siteForm.get('latsec').value).toEqual('30.012');
    expect(component.siteForm.get('londeg').value).toEqual('-91');
    expect(component.siteForm.get('lonmin').value).toEqual('44');
    expect(component.siteForm.get('lonsec').value).toEqual('30.012');
  });

  it('should re-upload file', () => {
    const response = {
      description: "test 24224",
      fileBelongsTo: "Site File",
      fileType: "Link",
      file_date: "2021-12-06T18:00:00",
      file_id: 1,
      filetype_id: 8,
      latitude_dd: null,
      longitude_dd: null,
      name: "test file 24224",
      photo_date: "2021-12-06T18:00:00",
      photo_direction: null,
      site_id: 24224,
      source_id: 1,
    }

    component.returnData.files = [{file_id: 1}];
    
    spyOn(component.siteEditService, 'uploadFile').and.returnValue(
        of(response)
    );

    component.saveFileUpload();
    fixture.detectChanges();
    expect(component.returnData.files).toEqual([response]);
    expect(component.initSiteFiles).toEqual([response]);
  });

  it('should set file attributes', () => {
    let event = {target: {files: [{name: "testFile"}]}};

    component.returnData.files = [{file_id: 108937}];

    component.getFileName(event);
    fixture.detectChanges();
    expect(component.fileUploading).toEqual(true);
    expect(component.siteFiles.File).toEqual({name: "testFile"});
    expect(component.siteFileForm.get("photo_date").validator).toEqual(null);
  });

  it('should hide and reset file form', () => {
    component.cancelFile();
    fixture.detectChanges();
    expect(component.showFileForm).toBeFalse();
    expect(component.siteFiles).toEqual({
      FileEntity: {
        file_id: null,
        name: null,
        FULLname: null,
        source_id: null,
        description: null,
        file_date: null,
        photo_date: null,
        agency_id: null,
        site_id: null,
        filetype_id: null,
        path: null,
        last_updated: null,
        last_updated_by: null,
        site_description: null,
        photo_direction: null,
        latitude_dd: null,
        longitude_dd: null,
      },
      File: null
    });
  });

  it('should show blank file form and set default date value', () => {
    component.addSiteFile();
    fixture.detectChanges();
    expect(component.showFileForm).toBeTrue();
    expect(component.addFileType).toEqual("New");
    expect(component.siteFileForm.get("file_date").value).not.toEqual(null);
    expect(component.siteFileForm.get("photo_date").value).not.toEqual(null);
  });

  it('should show alert and stop loading if site form is invalid', () => {
    component.siteForm.get("site_description").setValue(null);
    
    let dialogSpy = spyOn(component.dialog, 'open');

    component.submitSiteForm();
    fixture.detectChanges();
    expect(component.valid).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should not call putSite and show alert if landowner invalid', () => {
    component.siteForm.get("site_description").setValue("test");
    component.siteForm.get("county").setValue("Dane");
    component.siteForm.get("hcollect_method_id").setValue(2);
    component.siteForm.get("hdatum_id").setValue(2);
    component.siteForm.get("state").setValue("WI");
    component.siteForm.get("waterbody").setValue("test");

    component.siteForm.get("landownercontact_id").setValue(9999);
    component.landownerForm.markAsDirty();
    let putSiteSpy = spyOn(component, 'putSite');
    let dialogSpy = spyOn(component.dialog, 'open');

    component.submitSiteForm();
    fixture.detectChanges();

    expect(component.landownerValid).toBeFalse();
    expect(putSiteSpy).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should call putSite and post landowner form', () => {
    let response = {};
    component.siteForm.get("site_description").setValue("test");
    component.siteForm.get("county").setValue("Dane");
    component.siteForm.get("hcollect_method_id").setValue(2);
    component.siteForm.get("hdatum_id").setValue(2);
    component.siteForm.get("state").setValue("WI");
    component.siteForm.get("waterbody").setValue("test");

    component.landownerForm.get("landownercontact_id").setValue(null);
    component.landownerForm.get("fname").setValue("test");
    component.landownerForm.markAsDirty();
    let putSiteSpy = spyOn(component, 'putSite');
    let postLandownerSpy = spyOn(component.siteEditService, 'postLandowner').and.returnValue(
      of(response)
    );

    component.submitSiteForm();
    fixture.detectChanges();

    expect(component.landownerValid).toBeTrue();
    expect(putSiteSpy).toHaveBeenCalled();
    expect(postLandownerSpy).toHaveBeenCalledWith(component.landownerForm.value);
  });

  it('should call putSite and put landowner form', () => {
    let response = {};
    component.siteForm.get("site_description").setValue("test");
    component.siteForm.get("county").setValue("Dane");
    component.siteForm.get("hcollect_method_id").setValue(2);
    component.siteForm.get("hdatum_id").setValue(2);
    component.siteForm.get("state").setValue("WI");
    component.siteForm.get("waterbody").setValue("test");

    component.landownerForm.get("fname").setValue("test");
    component.landownerForm.get("landownercontact_id").setValue(9999);
    component.landownerForm.markAsDirty();
    let putSiteSpy = spyOn(component, 'putSite');
    let putLandownerSpy = spyOn(component.siteEditService, 'putLandowner').and.returnValue(
      of(response)
    );

    component.submitSiteForm();
    fixture.detectChanges();

    expect(component.landownerValid).toBeTrue();
    expect(putSiteSpy).toHaveBeenCalled();
    expect(putLandownerSpy).toHaveBeenCalledWith(component.landownerForm.get("landownercontact_id").value, component.landownerForm.value);
  });

  it('should delete file and remove from page', () => {
    component.returnData.files = [{file_id: 1}, {file_id: 2}];
    let response = {file_id: 1};
    
    
    spyOn(component.dialog, 'open')
     .and
     .returnValue({afterClosed: () => of(true)} as MatDialogRef<unknown>);
    spyOn(component.siteEditService, 'deleteFile').and.returnValue(
      of(response)
    );

    component.deleteFile();
    fixture.detectChanges();
    
    expect(component.returnData.files.length).toEqual(1);
    expect(component.returnData.files).toEqual([{file_id: 2}]);
    expect(component.initSiteFiles).toEqual([{file_id: 2}]);
    expect(component.showFileForm).toBeFalse();
  });

  it('should create file and add to page', () => {
    component.siteFileForm.get("filetype_id").setValue(1);
    component.siteFileForm.get("file_date").setValue("2018-12-29T22:55:17.129");
    component.siteFileForm.get("site_id").setValue(24224);
    component.siteFileForm.get("description").setValue("test file");
    component.siteFileForm.get("FULLname").setValue("test");
    component.siteFileForm.get("agency_id").setValue(9999);
    component.returnData.files = [];

    let response = {filetype_id: 1, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file"};
    let sourceResponse = { source_name: "test", source_id: 9999}
    spyOn(component.siteEditService, 'postSource').and.returnValue(
      of(sourceResponse)
    );
    spyOn(component.siteEditService, 'uploadFile').and.returnValue(
      of(response)
    );

    component.createFile();
    fixture.detectChanges();

    expect(component.returnData.files).toEqual([ {filetype_id: 1, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file"} ]);
    expect(component.initSiteFiles).toEqual([ {filetype_id: 1, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file"} ]);
    expect(component.loading).toBeFalse();
    expect(component.showFileForm).toBeFalse();
  });

  it('should create link file and add to page', () => {
    component.siteFileForm.get("filetype_id").setValue(8);
    component.siteFileForm.get("file_date").setValue("2018-12-29T22:55:17.129");
    component.siteFileForm.get("description").setValue("test file");
    component.siteFileForm.get("FULLname").setValue("test");
    component.siteFileForm.get("agency_id").setValue(9999);
    component.returnData.files = [];
    component.data.site.site_id = 24224;

    let response = {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file"};
    let sourceResponse = { source_name: "test", source_id: 9999}
    spyOn(component.siteEditService, 'postSource').and.returnValue(
      of(sourceResponse)
    );
    spyOn(component.siteEditService, 'saveFile').and.returnValue(
      of(response)
    );

    component.createFile();
    fixture.detectChanges();

    expect(component.returnData.files).toEqual([ {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file"} ]);
    expect(component.initSiteFiles).toEqual([ {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file"} ]);
    expect(component.loading).toBeFalse();
    expect(component.showFileForm).toBeFalse();
  });

  it('should cancel loading and show alert if file form is invalid', () => {
    component.siteFileForm.get("filetype_id").setValue(8);
    component.siteFileForm.get("file_date").setValue("2018-12-29T22:55:17.129");
    component.siteFileForm.get("FULLname").setValue("test");
    component.siteFileForm.get("agency_id").setValue(9999);
    let dialogSpy = spyOn(component.dialog, 'open');

    component.createFile();
    fixture.detectChanges();

    expect(dialogSpy).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should update exisiting file', () => {
    component.siteFileForm.get("filetype_id").setValue(8);
    component.siteFileForm.get("file_date").setValue("2018-12-29T22:55:17.129");
    component.siteFileForm.get("description").setValue("test file");
    component.siteFileForm.get("FULLname").setValue("test");
    component.siteFileForm.get("agency_id").setValue(9999);
    component.siteFileForm.get("source_id").setValue(9999);
    component.returnData.files = [{filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test", file_id: 9999}];
    component.data.site.site_id = 24224;

    let response = {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file", file_id: 9999};
    let sourceResponse = { source_name: "test", source_id: 9999}
    spyOn(component.siteEditService, 'postSource').and.returnValue(
      of(sourceResponse)
    );
    spyOn(component.siteEditService, 'updateFile').and.returnValue(
      of(response)
    );

    component.saveFile();
    fixture.detectChanges();

    expect(component.returnData.files).toEqual([ {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file", file_id: 9999} ]);
    expect(component.initSiteFiles).toEqual([ {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file", file_id: 9999} ]);
    expect(component.loading).toBeFalse();
    expect(component.showFileForm).toBeFalse();
  });

  it('should cancel loading and show alert if file update form is invalid', () => {
    component.siteFileForm.get("filetype_id").setValue(8);
    component.siteFileForm.get("file_date").setValue("2018-12-29T22:55:17.129");
    component.siteFileForm.get("FULLname").setValue("test");
    component.siteFileForm.get("agency_id").setValue(9999);
    
    let dialogSpy = spyOn(component.dialog, 'open');

    component.saveFile();
    fixture.detectChanges();

    expect(dialogSpy).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should add housing type name to object and return', () => {
    let response = {housing_type_id: 1};
    component.siteHousingLookup = [{housing_type_id: 1, type_name: "test"}, {housing_type_id: 2, type_name: "test2"}]

    let returnValue = component.getHousingType(response);
    fixture.detectChanges();

    expect(returnValue).toEqual({housing_type_id: 1, housingType: "test"});
  });

  it('should return return a filetype name', () => {
    let response = 1;
    component.fileTypes = [{filetype_id: 1, filetype: "photo"}, {filetype_id: 2, filetype: "link"}]

    let returnValue = component.fileTypeLookup(response);
    fixture.detectChanges();

    expect(returnValue).toEqual("photo");
  });

  it('should submit new site info', (done) => {
    component.latLngUnit = "decdeg";
    component.siteForm.get("site_id").setValue(24224);
    component.siteForm.get("site_description").setValue("test");
    component.siteForm.get("county").setValue("Dane");
    component.siteForm.get("hcollect_method_id").setValue(2);
    component.siteForm.get("hdatum_id").setValue(2);
    component.siteForm.get("state").setValue("WI");
    component.siteForm.get("waterbody").setValue("test");
    component.siteForm.controls["siteHousings"] = new FormArray([new FormGroup({housingType: new FormControl("test"), housing_type_id: new FormControl(1)})]);
    component.housingTypeArray = ["test"]
    component.data.networkName = undefined;
    component.data.networkType = undefined;
    component.networkTypes = [];
    component.networkNames = [];
    component.siteForm.get("siteHousings").markAsDirty();
    component.siteHousingLookup = [{housing_type_id: 1, type_name: "test"}, {housing_type_id: 2, type_name: "testHousing"}]

    let siteResponse = {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file", file_id: 9999};
    spyOn(component.siteEditService, 'putSite').and.returnValue(
      of(siteResponse)
    );
    component.data.siteHousing = [{amount: 1, housing_type_id: 2, housingType: "testHousing", site_housing_id: 1}];
    spyOn(component.siteEditService, 'deleteSiteHousings').and.returnValue(
      of([])
    );

    spyOn(component.siteEditService, 'postSiteHousings').and.returnValue(
      of({housing_type_id: 1})
    );

    component.putSite().then(() => {
      fixture.detectChanges();

      expect(component.returnData.site).toEqual(siteResponse);
      done();
    });
  });

  it('should convert lat/lng and submit new site info', (done) => {
    component.siteForm.get("site_id").setValue(24224);
    component.siteForm.get("site_description").setValue("test");
    component.siteForm.get("county").setValue("Dane");
    component.siteForm.get("hcollect_method_id").setValue(2);
    component.siteForm.get("hdatum_id").setValue(2);
    component.siteForm.get("state").setValue("WI");
    component.siteForm.get("waterbody").setValue("test");
    component.siteForm.controls["siteHousings"] = new FormArray([new FormGroup({housingType: new FormControl("test"), housing_type_id: new FormControl(1)})]);
    component.housingTypeArray = ["test"]
    component.data.networkType = "testNetwork";
    component.data.networkName = "testName";
    component.networkTypes = [{network_type_name: "networkTypeName2", selected: true}];
    component.networkNames = [{name: "testName2", selected: true}];
    component.selectedNetworkTypes = ["networkTypeName2"];
    component.selectedNetworkNames = ["networkname2"];
    component.siteForm.get("siteHousings").markAsDirty();
    component.siteHousingLookup = [{housing_type_id: 1, type_name: "test"}, {housing_type_id: 2, type_name: "testHousing"}]

    let siteResponse = {filetype_id: 8, file_date: "2018-12-29T22:55:17.129", site_id: 242224, description: "test file", file_id: 9999};
    spyOn(component.siteEditService, 'putSite').and.returnValue(
      of(siteResponse)
    );
    component.data.siteHousing = [{amount: 1, housing_type_id: 2, housingType: "testHousing", site_housing_id: 1}];
    spyOn(component.siteEditService, 'deleteSiteHousings').and.returnValue(
      of([])
    );

    spyOn(component.siteEditService, 'postSiteHousings').and.returnValue(
      of({housing_type_id: 1})
    );

    spyOn(component.siteEditService, 'deleteNetworkNames').and.returnValue(
      of([])
    );

    spyOn(component.siteEditService, 'postNetworkNames').and.returnValue(
      of([{network_name_id: 2, name: "networkname2"}])
    );

    spyOn(component.siteEditService, 'deleteNetworkTypes').and.returnValue(
      of([])
    );

    spyOn(component.siteEditService, 'postNetworkTypes').and.returnValue(
      of([{network_type_id: 2, network_type_name: "networkTypeName2"}])
    );

    component.latLngUnit = "dms";
    
    component.siteForm.get('latdeg').setValue('47');
    component.siteForm.get('latmin').setValue('26');
    component.siteForm.get('latsec').setValue('30.012');
    component.siteForm.get('londeg').setValue('-91');
    component.siteForm.get('lonmin').setValue('44');
    component.siteForm.get('lonsec').setValue('30.012');

    component.putSite().then(() => {
      fixture.detectChanges();

      expect(component.returnData.site).toEqual(siteResponse);
      expect(component.siteForm.get('latitude_dd').value).toEqual('47.44167');
      expect(component.siteForm.get('longitude_dd').value).toEqual('-91.74167');
      expect(component.returnData.housings).toEqual([{housing_type_id: 1, housingType: "test"}]);
      expect(component.returnData.networkName).toEqual(["networkname2"]);
      expect(component.returnData.networkType).toEqual(["networkTypeName2"]);
      done();
    });
  });
});