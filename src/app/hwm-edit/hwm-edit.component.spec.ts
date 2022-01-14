import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
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
      name: null,
      description: null,
      unquanitified: null,
      latitude_dd: null,
      longitude_dd: null,
      hdatum_id: null,
      hcollect_method_id: null,
      vdatum_id: null,
      vcollect_method_id: null,
      objective_point_id: 0,
    },
    hdatumList: [],
    hmethodList: [],
    files: [],
    site_id: 10000,
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HwmEditComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [MatDialogModule, HttpClientTestingModule, MatTableModule],
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

    spyOn(component.siteService, 'getMemberName').and.returnValue(
        of(response)
    );

    component.setMembers();
    fixture.detectChanges();
    expect(component.surveyMember).toEqual("John Smith");
    expect(component.flagMember).toEqual("John Smith");
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
    expect(component.approvalDate).toEqual(new Date(response.approval_date));
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
    // WIP
    component.hwmQualities = [
      // {hwm_quality_id : 1, max_range: , min_range: },
      // {hwm_quality_id : 2, max_range: , min_range: },
      // {hwm_quality_id : 3, max_range: , min_range: },
      // {hwm_quality_id : 4, max_range: , min_range: },
      // {hwm_quality_id : 5, max_range: , min_range: },
    ];
    component.form.get("uncertainty").setValue(1);

    component.chooseQuality();
    fixture.detectChanges();

    expect(component.form.get("hwm_quality_id")).toBe(5);
  });

  it('should show alert and stop loading if form is invalid', () => {
    component.form.get("hwm_label").setValue(null);
    spyOn(window, 'alert');

    component.submit();
    fixture.detectChanges();
    expect(component.form.valid).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(window.alert).toHaveBeenCalledWith("Some required HWM fields are missing or incorrect.  Please fix these fields before submitting.");
  });
});
