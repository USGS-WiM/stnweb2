import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RefDatumEditComponent } from './ref-datum-edit.component';
import { OpEditService } from '@app/services/op-edit.service';
import { of } from 'rxjs';

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
      imports: [MatDialogModule, HttpClientTestingModule],
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

    spyOn(component.siteService, 'getOPControlID').and.returnValue(
        of(response)
    );

    component.getControlID();
    fixture.detectChanges();
    expect(component.controlID).toEqual(response);
    expect(component.form.get("op_control_identifier").value).toEqual(response);
  });

  it('should get the intial files for the reference datum', () => {
    data.files = [{objective_point_id: 0}];
    data.rd.objective_point_id = 0;
    component.getInitFiles();
    fixture.detectChanges();
    expect(component.initDatumFiles.length).toEqual(1);
    expect(component.initDatumFiles).toEqual(data.files);
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

});
