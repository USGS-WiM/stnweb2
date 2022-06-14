import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { HwmEditComponent } from './hwm-edit.component';

describe('HwmEditComponent', () => {
  let component: HwmEditComponent;
  let fixture: ComponentFixture<HwmEditComponent>;

  const dialogMock = {
    close: () => {},
  };

  let data = {
    hwm: {
      hwm_type_id: 1,
      hwm_quality_id: 1,
      hwm_environment: "Riverine",
      latitude_dd: 45,
      longitude_dd: 78,
      hdatum_id: 1,
      hcollect_method_id: 1,
      flag_date: "2022-01-01T21:20:00.000000",
      hwm_label: "test",
      hwm_locationdescription: "test",
      hwm_id: 0,
    },
    hdatumList: [],
    hmethodList: [],
    files: [{file_id: 0, hwm_id: 0}],
    site_id: 10000,
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HwmEditComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [MatDialogModule, HttpClientTestingModule, MatTableModule, NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HwmEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the event lookup', () => {
    const response: any[] = [{event_id: 0, event_name: "test"}];

    spyOn(component.eventService, 'getAllEvents').and.returnValue(
        of(response)
    );

    component.getEventList();
    fixture.detectChanges();
    expect(component.events).toEqual(response);
  });


  it('should set the vdatum lookup', () => {
    const response: any[] = [{datum_id: 0}];

    spyOn(component.siteService, 'getVDatumLookup').and.returnValue(
        of(response)
    );

    component.getVDatums();
    fixture.detectChanges();
    expect(component.vdatums).toEqual(response);
  });

  it('should set the vmethod lookup', () => {
    const response: any[] = [{vcollect_method_id: 0}];

    spyOn(component.siteService, 'getVMethodLookup').and.returnValue(
        of(response)
    );

    component.getVMethods();
    fixture.detectChanges();
    expect(component.vmethods).toEqual(response);
  });

  it('should set the hwm type lookup', () => {
    const response: any[] = [{hwm_type_id: 0}];

    spyOn(component.hwmEditService, 'getHWMTypeLookup').and.returnValue(
        of(response)
    );

    component.getHWMTypes();
    fixture.detectChanges();
    expect(component.hwmTypes).toEqual(response);
  });

  it('should set the hwm marker lookup', () => {
    const response: any[] = [{marker_id: 0}];

    spyOn(component.hwmEditService, 'getHWMMarkerLookup').and.returnValue(
        of(response)
    );

    component.getHWMMarkers();
    fixture.detectChanges();
    expect(component.hwmMarkers).toEqual(response);
  });

  it('should set the hwm quality lookup', () => {
    const response: any[] = [{hwm_quality_id: 0}];

    spyOn(component.hwmEditService, 'getHWMQualityLookup').and.returnValue(
        of(response)
    );

    component.getHWMQualities();
    fixture.detectChanges();
    expect(component.hwmQualities).toEqual(response);
  });

  it('should get the survey and flag member name', () => {
    const response = {member_id: 1, fname: "John", lname: "Smith"};

    let memberSpy = spyOn(component.siteService, 'getMemberName').and.returnValue(
        of(response)
    );

    component.setMembers();
    fixture.detectChanges();
    expect(component.surveyMember).toEqual(undefined);
    expect(component.flagMember).toEqual("John Smith");
    expect(memberSpy).toHaveBeenCalledTimes(1);
  });

  it('should get the approval info', () => {
    const response = {approval_id: 1, approval_date: "2022-01-01T21:20:00.000000", member_id: 1};
    const memberResponse = {member_id: 1, fname: "John", lname: "Smith"};

    spyOn(component.hwmEditService, 'getApproval').and.returnValue(
        of(response)
    );

    spyOn(component.siteService, 'getMemberName').and.returnValue(
      of(memberResponse)
  );

    component.getApproval();
    fixture.detectChanges();
    expect(component.approvalMember).toEqual("John Smith");
    expect(component.approvalDate).toEqual('Sat, 01 Jan 2022 21:20:00 GMT');
  });

  it('should set the initial file list for table', () => {
    component.initHWMFiles = [];
    component.data.files = [{file_id: 0, hwm_id: 0}, {file_id: 1, hwm_id: 1}]

    component.getInitFiles();
    fixture.detectChanges();

    expect(component.initHWMFiles).toEqual([component.data.files[0]]);
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

  it('should change lat/lng unit', () => {
    let event = {value: "decdeg"};
    component.form.get("latdeg").setValue(47);
    component.form.get("latmin").setValue(26);
    component.form.get("latsec").setValue(30.012);
    component.form.get("londeg").setValue(-91);
    component.form.get("lonmin").setValue(44);
    component.form.get("lonsec").setValue(30.012);

    component.changeLatLngUnit(event);
    fixture.detectChanges();
    expect(component.form.get('latitude_dd').value).toEqual('47.44167');
    expect(component.form.get('longitude_dd').value).toEqual('-91.74167');
    expect(component.incorrectDMS).toBeFalse();

    event = {value: "decdeg"};
    component.form.get("latdeg").setValue(undefined);
    component.form.get("latmin").setValue(26);
    component.form.get("latsec").setValue(30.012);
    component.form.get("londeg").setValue(undefined);
    component.form.get("lonmin").setValue(44);
    component.form.get("lonsec").setValue(30.012);
    // clear lat/lng values before function is executed again
    component.form.get("latitude_dd").setValue(null);
    component.form.get("longitude_dd").setValue(null);

    component.changeLatLngUnit(event);
    fixture.detectChanges();
    expect(component.form.get('latitude_dd').value).toEqual(null);
    expect(component.form.get('longitude_dd').value).toEqual(null);
    expect(component.incorrectDMS).toBeTrue();

    event = {value: "dms"}
    component.form.get("latitude_dd").setValue(47.44167);
    component.form.get("longitude_dd").setValue(-91.74167);

    component.changeLatLngUnit(event);
    fixture.detectChanges();
    expect(component.form.get('latdeg').value).toEqual('47');
    expect(component.form.get('latmin').value).toEqual('26');
    expect(component.form.get('latsec').value).toEqual('30.012');
    expect(component.form.get('londeg').value).toEqual('-91');
    expect(component.form.get('lonmin').value).toEqual('44');
    expect(component.form.get('lonsec').value).toEqual('30.012');
  });

  it('should change uncertainty unit', () => {
    component.uncertainty_unit = "ft";
    component.uncertaintyUnitChange("cm");

    fixture.detectChanges();
    expect(component.uncertainty_unit).toEqual("cm");

    component.uncertaintyUnitChange("ft");
    
    fixture.detectChanges();
    expect(component.uncertainty_unit).toEqual("ft");
  });

  it('should change HWM environment', () => {
    component.hwm_environment = "Coastal";
    component.changeHWMEnvironment("Riverine");

    fixture.detectChanges();
    expect(component.hwm_environment).toEqual("Riverine");
    expect(component.form.controls.hwm_environment.value).toEqual("Riverine");

    component.changeHWMEnvironment("Coastal");
    
    fixture.detectChanges();
    expect(component.hwm_environment).toEqual("Coastal");
    expect(component.form.controls.hwm_environment.value).toEqual("Coastal");
  });

  it('should change stillwater value', () => {
    component.isStillwater = "Yes";
    component.changeStillwater("No");

    fixture.detectChanges();
    expect(component.isStillwater).toEqual("No");
    expect(component.form.controls.stillwater.value).toEqual(0);

    component.changeStillwater("Yes");
    
    fixture.detectChanges();
    expect(component.isStillwater).toEqual("Yes");
    expect(component.form.controls.stillwater.value).toEqual(1);
  });

  it('should change bank value', () => {
    component.hwmBank = "Left";
    component.changeBank("Right");

    fixture.detectChanges();
    expect(component.hwmBank).toEqual("Right");
    expect(component.form.controls.bank.value).toEqual("Right");

    component.changeBank("Left");
    
    fixture.detectChanges();
    expect(component.hwmBank).toEqual("Left");
    expect(component.form.controls.bank.value).toEqual("Left");

    component.changeBank("N/A");
    
    fixture.detectChanges();
    expect(component.hwmBank).toEqual("N/A");
    expect(component.form.controls.bank.value).toEqual("N/A");
  });

  it('should assign a corresponding HWM quality', () => {
    component.hwmQualities = [
      {hwm_quality_id : 1, max_range: 0.05, min_range: 0},
      {hwm_quality_id : 2, max_range: 0.1, min_range: 0.051},
      {hwm_quality_id : 3, max_range: .2, min_range: .101},
      {hwm_quality_id : 4, max_range: .4, min_range: .201},
      {hwm_quality_id : 5, max_range: 1, min_range: .401},
    ];
    component.form.get("hwm_uncertainty").setValue(1.2);

    component.chooseQuality();
    fixture.detectChanges();

    expect(component.form.get("hwm_quality_id").value).toBe(5);

    component.form.get("hwm_uncertainty").setValue(0.15);

    component.chooseQuality();
    fixture.detectChanges();

    expect(component.form.get("hwm_quality_id").value).toBe(3);
  });

  it('should check the uncertainty value', () => {
    component.hwmQualities = [
      {hwm_quality_id : 1, max_range: 0.05, min_range: 0},
      {hwm_quality_id : 2, max_range: 0.1, min_range: 0.051},
      {hwm_quality_id : 3, max_range: .2, min_range: .101},
      {hwm_quality_id : 4, max_range: .4, min_range: .201},
      {hwm_quality_id : 5, max_range: 1, min_range: .401},
    ];
    let dialogSpy = spyOn(component.dialog, 'open');
    component.form.get("hwm_uncertainty").setValue(0.75);
    component.form.get("hwm_quality_id").setValue(5);

    component.compareToUncertainty();
    fixture.detectChanges();

    expect(dialogSpy).not.toHaveBeenCalled();
    
    component.form.get("hwm_quality_id").setValue(4);

    component.compareToUncertainty();
    fixture.detectChanges();

    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should show alert and stop loading if form is invalid', () => {
    component.form.get("hwm_label").setValue(null);
    let dialogSpy = spyOn(component.dialog, 'open');

    component.submit();
    fixture.detectChanges();
    expect(component.form.valid).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should create a new date without time', () => {
    let date = component.makeAdate("");
    fixture.detectChanges();
    expect(date.getFullYear()).toEqual(new Date().getFullYear());
    expect(date.getMonth()).toEqual(new Date().getMonth());
    expect(String(date.getMinutes())).toEqual("0");
    expect(String(date.getHours())).toEqual("0");

    date = component.makeAdate(new Date());
    fixture.detectChanges();
    expect(date.getFullYear()).toEqual(new Date().getFullYear());
    expect(date.getMonth()).toEqual(new Date().getMonth());
    expect(String(date.getMinutes())).toEqual("0");
    expect(String(date.getHours())).toEqual("0");
  });

  it('should convert form values and send requests if form is valid', () => {
    component.uncertainty_unit = "cm";
    component.latLngUnit = "dms";
    component.form.get("latdeg").setValue(47);
    component.form.get("latmin").setValue(26);
    component.form.get("latsec").setValue(30.012);
    component.form.get("londeg").setValue(-91);
    component.form.get("lonmin").setValue(44);
    component.form.get("lonsec").setValue(30.012);
    // component.form.get("survey_date").setValue("2022-01-01T21:20:00.000000");

    component.form.get("uncertainty").setValue(20);

    let requestSpy = spyOn(component, 'sendRequests');

    component.submit();
    fixture.detectChanges();
    expect(component.form.valid).toBeTrue();
    expect(component.loading).toBeTrue();
    expect(component.form.get("uncertainty").value).toEqual('0.656168');
    expect(component.form.get('latitude_dd').value).toEqual('47.44167');
    expect(component.form.get('longitude_dd').value).toEqual('-91.74167');
    expect(requestSpy).toHaveBeenCalled();
  });

  it('should send update requests and set return data to results', () => {
    let response = data.hwm;
    component.editOrCreate = "Edit";
    let returnData = {
      hwm_type_id: 1,
      hwm_quality_id: 1,
      hwm_environment: "Riverine",
      latitude_dd: 45,
      longitude_dd: 78,
      hdatum_id: 1,
      hcollect_method_id: 1,
      flag_date: "2022-01-01T21:20:00.000000",
      hwm_label: "test",
      hwm_locationdescription: "test",
      hwm_id: 0,
    }

    spyOn(component.hwmEditService, 'putHWM').and.returnValue(
      of(response)
    );

    component.sendRequests();
    fixture.detectChanges();

    expect(component.returnData).toEqual(returnData);
    component.editOrCreate = "";
  });

  it('should send create requests and set return data to results', () => {
    let response = data.hwm;
    component.editOrCreate = "Create";
    let returnData = {
      hwm_type_id: 1,
      hwm_quality_id: 1,
      hwm_environment: "Riverine",
      latitude_dd: 45,
      longitude_dd: 78,
      hdatum_id: 1,
      hcollect_method_id: 1,
      flag_date: "2022-01-01T21:20:00.000000",
      hwm_label: "test",
      hwm_locationdescription: "test",
      hwm_id: 0,
    }

    spyOn(component.hwmEditService, 'postHWM').and.returnValue(
      of(response)
    );

    component.sendRequests();
    fixture.detectChanges();

    expect(component.returnData).toEqual(returnData);
    component.editOrCreate = "";
  });
});
