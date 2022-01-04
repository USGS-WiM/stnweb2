import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RefDatumEditComponent } from './ref-datum-edit.component';
import { OpEditService } from '@app/services/op-edit.service';
import { of } from 'rxjs';
import { compileComponentFromMetadata } from '@angular/compiler';

describe('RefDatumEditComponent', () => {
  let component: RefDatumEditComponent;
  let fixture: ComponentFixture<RefDatumEditComponent>;

  const dialogMock = {
    close: () => {},
  };

  let data = {
    rd: {
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
    site_id: 24224,
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefDatumEditComponent ],
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
    fixture = TestBed.createComponent(RefDatumEditComponent);
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

  it('should set the op quality lookup', () => {
    const response: any[] = [{op_quality_id: 0}];

    spyOn(component.siteService, 'getOPQualityLookup').and.returnValue(
        of(response)
    );

    component.getOPQuality();
    fixture.detectChanges();
    expect(component.opQualities).toEqual(response);
  });

  it('should set the op type lookup', () => {
    const response: any[] = [{op_type_id: 0}];

    spyOn(component.siteService, 'getOPTypeLookup').and.returnValue(
        of(response)
    );

    component.getOPTypes();
    fixture.detectChanges();
    expect(component.types).toEqual(response);
  });

  it('should get the control identifiers for the reference datum', () => {
    const response: any[] = [{objective_point_id: 0}];
    const noOPControl: any[] = [{op_control_identifier_id: null, objective_point_id: null, identifier: null, identifier_type: null, last_updated: null, last_updated_by: null}];

    spyOn(component.siteService, 'getOPControlID').and.returnValue(
        of(response)
    );

    component.getControlID();
    fixture.detectChanges();
    expect(component.controlID).toEqual(response);
    expect(component.form.get("op_control_identifier").value).toEqual(noOPControl);
  });

  it('should get the intial files for the reference datum', () => {
    data.files = [{objective_point_id: 0}];
    data.rd.objective_point_id = 0;
    component.getInitFiles();
    fixture.detectChanges();
    expect(component.initDatumFiles.length).toEqual(1);
    expect(component.initDatumFiles).toEqual(data.files);
  });

  it('should add control to list', () => {
    component.controlsToAdd = [];
    component.addControl();
    fixture.detectChanges();
    expect(component.controlsToAdd).toEqual([component.controlObj]);
    expect(component.form.get("op_control_identifier").value).toEqual([component.controlObj]);
  });

  it('should remove control from list', () => {
    component.controlsToAdd = [{op_control_identifier_id: 8, objective_point_id: 0, identifier: "test", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0}];
    let control = {op_control_identifier_id: 8, objective_point_id: 0, identifier: "test", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0};
    let i = 0;
    component.removeControlIdentifier(control, i);
    fixture.detectChanges();
    expect(component.controlsToRemove).toEqual([{op_control_identifier_id: 8, objective_point_id: 0, identifier: "test", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0}]);
    expect(component.controlsToAdd).toEqual([]);
  });

  it('should change elevation unit', () => {
    let event = {value: "m"};
    component.elev_unit = "ft";
    component.elevUnitChange(event);

    fixture.detectChanges();
    expect(component.elev_unit).toEqual("m");

    event = {value: "ft"};
    component.elevUnitChange(event);
    
    fixture.detectChanges();
    expect(component.elev_unit).toEqual("ft");
  });

  it('should change uncertaity unit', () => {
    let event = {value: "cm"};
    component.uncertainty_unit = "ft";
    component.uncertaintyUnitChange(event);

    fixture.detectChanges();
    expect(component.uncertainty_unit).toEqual("cm");

    event = {value: "ft"};
    component.uncertaintyUnitChange(event);
    
    fixture.detectChanges();
    expect(component.uncertainty_unit).toEqual("ft");
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

  it('should show alert and stop loading if site form is invalid', () => {
    component.form.get("description").setValue(null);
    spyOn(window, 'alert');

    component.submit();
    fixture.detectChanges();
    expect(component.form.valid).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(window.alert).toHaveBeenCalledWith("Some required reference datum fields are missing or incorrect.  Please fix these fields before submitting.");
  });

  it('should submit new reference datum info', (done) => {
    component.latLngUnit = "decdeg";
    component.form.get("op_type_id").setValue(0);
    component.form.get("description").setValue("test");
    component.form.get("name").setValue("test");
    component.form.get("vdatum_id").setValue(2);
    component.form.get("date_established").setValue("2018-12-20T22:55:17.129");
    component.controlsToAdd = [];
    component.controlsToRemove = [];

    let rdResponse = {op_type_id: 0, description: "test", name: "test", vdatum: 2, date_established: "2018-12-20T22:55:17.129"};
    spyOn(component.opEditService, 'putReferenceDatum').and.returnValue(
      of(rdResponse)
    );

    component.sendRequests().then(() => {
      fixture.detectChanges();

      expect(component.returnData.referenceDatums).toEqual(rdResponse);
      done();
    });
  });

  it('should submit new op control and remove deleted op controls', (done) => {
    component.latLngUnit = "decdeg";
    component.form.get("op_type_id").setValue(0);
    component.form.get("description").setValue("test");
    component.form.get("name").setValue("test");
    component.form.get("vdatum_id").setValue(2);
    component.form.get("date_established").setValue("2018-12-20T22:55:17.129");
    component.controlID = [{op_control_identifier_id: 2, objective_point_id: 0, identifier: "test1", identifier_type: "Other", last_updated: "2018-12-19T22:55:17.129", last_updated_by: 0}, {op_control_identifier_id: 3, objective_point_id: 0, identifier: "test2", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0}];
    component.controlsToAdd = [{op_control_identifier_id: null, objective_point_id: 0, identifier: "test", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0}, {op_control_identifier_id: 3, objective_point_id: 0, identifier: "test3", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0}];
    component.controlsToRemove = [{op_control_identifier_id: 2, objective_point_id: 0, identifier: "test1", identifier_type: "Other", last_updated: "2018-12-19T22:55:17.129", last_updated_by: 0}];

    let opControlResponse = {op_control_identifier_id: 1, objective_point_id: 0, identifier: "test", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0};
    let opUpdateResponse = {op_control_identifier_id: 3, objective_point_id: 0, identifier: "test3", identifier_type: "PID", last_updated: "2018-12-20T22:55:17.129", last_updated_by: 0};

    let rdResponse = {op_type_id: 0, description: "test", name: "test", vdatum: 2, date_established: "2018-12-20T22:55:17.129"};
    spyOn(component.opEditService, 'putReferenceDatum').and.returnValue(
      of(rdResponse)
    );

    spyOn(component.opEditService, 'updateControlID').and.returnValue(
      of(opUpdateResponse)
    );

    spyOn(component.opEditService, 'postControlID').and.returnValue(
      of(opControlResponse)
    );

    spyOn(component.opEditService, 'deleteControlID').and.returnValue(
      of([])
    )

    component.sendRequests().then(() => {
      fixture.detectChanges();

      expect(component.returnData.opControlID).toEqual([opControlResponse, opUpdateResponse]);
      done();
    });
  });

});
