import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SensorEditComponent } from './sensor-edit.component';
import { of } from 'rxjs';

describe('SensorEditComponent', () => {
  let component: SensorEditComponent;
  let fixture: ComponentFixture<SensorEditComponent>;

  const dialogMock = {
    close: () => {},
  };

  let data = {
    sensor: {
      data_files: [],
      deploymentType: "Wave Height",
      deployment_type_id: 1,
      eventName: "Test Event",
      event_id: 1,
      files: [],
      housingType: "Pre-Deployed Bracket",
      housing_type_id: 1,
      instCollection: "Air",
      inst_collection_id: 1,
      instrument_id: 1111,
      instrument_status: [{
        instrument_id: 1111,
        instrument_status_id: 11001,
        member_id: 1,
        notes: "test",
        status: "Lost",
        status_type_id: 3,
        time_stamp: "2022-01-05T01:05:00",
        time_zone: "UTC",
        vdatum: "NAVD88",
      }],
      interval: 0,
      location_description: "Test",
      sensorBrand: "Hobo",
      sensorType: "Pressure Transducer",
      sensor_brand_id: 5,
      sensor_type_id: 1,
      serial_number: "000",
      site_id: 11111,
      statusType: "Lost",
    },
    files: [{
      instrument_id: 1111,
    },
    {
      instrument_id: 1111,
      is_nwis: 1,
    }],
    site_id: 11111,
    siteRefMarks: [{
      date_established: "2022-01-05T00:00:00",
      date_recovered: "2022-01-05T00:00:00",
      description: "test",
      files: [],
      hcollect_method_id: 0,
      hdatum_id: 1,
      last_updated: "2022-01-05T21:14:41.703869",
      last_updated_by: 1,
      latitude_dd: 37,
      longitude_dd: -90,
      name: "testOP",
      objective_point_id: 1,
      op_control_identifier: [],
      op_is_destroyed: 0,
      op_measurements: [],
      op_notes: "test notes",
      op_type_id: 1,
      site_id: 11111,
      uncertainty: 1,
      unquantified: "0",
      vcollect_method_id: 0,
      vdatum_id: 0,
    }],
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensorEditComponent ],
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
    fixture = TestBed.createComponent(SensorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the sensor type lookup', () => {
    const response: any[] = [{sensor_type_id: 0}];

    spyOn(component.sensorEditService, 'getSensorTypeLookup').and.returnValue(
        of(response)
    );

    component.getSensorTypes();
    fixture.detectChanges();
    expect(component.sensorTypes).toEqual(response);
  });

  it('should set the sensor brand lookup', () => {
    const response: any[] = [{sensor_brand_id: 0}];

    spyOn(component.sensorEditService, 'getSensorBrandLookup').and.returnValue(
        of(response)
    );

    component.getSensorBrands();
    fixture.detectChanges();
    expect(component.sensorBrands).toEqual(response);
  });

  it('should set the housing type lookup', () => {
    const response: any[] = [{housing_type_id: 0}];

    spyOn(component.siteService, 'getAllHousingTypes').and.returnValue(
        of(response)
    );

    component.getHousingTypes();
    fixture.detectChanges();
    expect(component.housingTypes).toEqual(response);
  });

  it('should set the deployment type lookup', () => {
    const response: any[] = [{deployment_type_id: 0}];

    spyOn(component.siteService, 'getDeploymentTypes').and.returnValue(
        of(response)
    );

    component.getDeploymentTypes();
    fixture.detectChanges();
    expect(component.deploymentTypes).toEqual(response);
  });

  it('should set the vdatum lookup', () => {
    const response: any[] = [{datum_id: 0, datum_name: "testDatum"}];

    spyOn(component.siteService, 'getVDatumLookup').and.returnValue(
        of(response)
    );

    component.getVDatums();
    fixture.detectChanges();
    expect(component.vDatumList).toEqual(response);
    expect(component.data.siteRefMarks[0].vdatum).toEqual(response[0].datum_name);
  });

  it('should set the collection condition lookup', () => {
    const response: any[] = [{inst_collection_id: 0}];

    spyOn(component.sensorEditService, 'getCollectConditions').and.returnValue(
        of(response)
    );

    component.collectConditionLookup();
    fixture.detectChanges();
    expect(component.collectConds).toEqual(response);
  });

  it('should split time stamp for formatting and set utc preview', () => {
    component.setTimeAndDate();
    fixture.detectChanges();
    expect(component.sensor.instrument_status[0].hour).toEqual("01");
    expect(component.sensor.instrument_status[0].minute).toEqual("05");
    expect(component.sensor.instrument_status[0].ampm).toEqual("AM");
    expect(component.sensor.instrument_status[0].utc_preview).toEqual("01/05/2022 01:05");
  });

  it('should split initial files into nwis and other sensor file lists', () => {
    component.initNWISFiles = [];
    component.initSensorFiles = [];

    component.getInitFiles();
    fixture.detectChanges();

    expect(component.initSensorFiles.length).toEqual(1);
    expect(component.initNWISFiles.length).toEqual(1);
  });

  it('should get the member name', () => {
    const response = {member_id: 1, fname: "John", lname: "Smith"};

    spyOn(component.siteService, 'getMemberName').and.returnValue(
        of(response)
    );

    component.setMembers();
    fixture.detectChanges();
    expect(component.sensor.instrument_status[0].member_name).toEqual("John Smith");
  });

  it('should call getTapedowns for each instrument', () => {
    let getTapedownSpy = spyOn(component, 'getTapedowns');

    component.createTapedownTable();
    fixture.detectChanges();

    expect(getTapedownSpy).toHaveBeenCalledTimes(1);
  });

  it('should create datasource for initial tapedown table', () => {
    const opMeasurementResponse = [{ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];
    spyOn(component.siteService, 'getOPMeasurements').and.returnValue(
      of(opMeasurementResponse)
    );
    const opInfoResponse = {name: "testOP", elev_ft: 1};
    spyOn(component.siteService, 'getOPInfo').and.returnValue(
      of(opInfoResponse)
    );

    component.getTapedowns(component.lostTapedowns, component.sensor.instrument_status[0], "lostTapedowns", component.initLostForm);
    fixture.detectChanges();

    
    expect(component.initLostTapedowns.length).toEqual(1);
    expect(component.initLostRefMarks[0]).toEqual("testOP");
    expect(component.initLostTapedowns[0].elevation).toEqual(1);
    expect(component.initLostTapedowns[0].vdatum).toEqual("NAVD88");
    expect(component.initLostForm).toEqual([{formgroup: {elevation: 1, ground_surface: 1, instrument_status_id: 11001, objective_point_id: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, vdatum: "NAVD88", op_name: "testOP" }, id: 0}])
  });

  it('should change am/pm', () => {
    component.setTimeAndDate();
    component.changeTime(component.sensor.instrument_status[0]);
    fixture.detectChanges();

    // Initially AM, switch to PM
    expect(component.sensor.instrument_status[0].ampm).toEqual("PM");
    expect(component.sensor.instrument_status[0].utc_preview).toEqual("01/05/2022 13:05");

    component.changeTime(component.sensor.instrument_status[0]);
    fixture.detectChanges();

    // Initially AM, switch to PM
    expect(component.sensor.instrument_status[0].ampm).toEqual("AM");
    expect(component.sensor.instrument_status[0].utc_preview).toEqual("01/05/2022 01:05");
  });

  it('should set newStatusID value if different from initial status', () => {
    // Init status id is 3
    component.statusChanged(2);
    fixture.detectChanges();

    expect(component.newStatusID).toEqual(2);

    component.statusChanged(3);
    fixture.detectChanges();

    expect(component.newStatusID).toEqual(null);
  });

  it('should add or remove a tapedown', () => {
    let confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    const response: any[] = [{datum_id: 0, datum_name: "testDatum"}];

    spyOn(component.siteService, 'getVDatumLookup').and.returnValue(
        of(response)
    );
    component.getVDatums();

    component.changeTableValue([], "Lost");
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.lostTapedowns).toEqual([]);

    component.changeTableValue([], "Deployed");
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.deployedTapedowns).toEqual([]);

    component.changeTableValue([], "Retrieved");
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.retrievedTapedowns).toEqual([]);

    component.changeTableValue(["testOP"], "Lost");
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.lostTapedowns).toEqual([
      {ground_surface: null,
      water_surface: null,
      offset_correction: null,
      op_measurements_id: null,
      op_name: "testOP",
      elevation: null,
      vdatum: "testDatum",
      instrument_status_id: 11001,
      objective_point_id: 1,
    }]);

    component.changeTableValue(["testOP"], "Deployed");
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.deployedTapedowns).toEqual([
      {ground_surface: null,
      water_surface: null,
      offset_correction: null,
      op_measurements_id: null,
      op_name: "testOP",
      elevation: null,
      vdatum: "testDatum",
      instrument_status_id: null,
      objective_point_id: 1,
    }]);

    component.changeTableValue(["testOP"], "Retrieved");
    fixture.detectChanges();

    expect(confirmSpy).toHaveBeenCalled();
    expect(component.retrievedTapedowns).toEqual([
      {ground_surface: null,
      water_surface: null,
      offset_correction: null,
      op_measurements_id: null,
      op_name: "testOP",
      elevation: null,
      vdatum: "testDatum",
      instrument_status_id: null,
      objective_point_id: 1,
    }]);
  });

  it('should change the time zone and update utc preview', () => {
    component.initForm();
    component.form.controls["instrument_status"].controls[0].controls["time_zone"].setValue("EST/EDT");
    component.setTimeZone(component.sensor.instrument_status[0]);
    fixture.detectChanges();
    expect(component.sensor.instrument_status[0].time_zone).toEqual("EST/EDT");
    expect(component.sensor.instrument_status[0].utc_preview).toEqual("01/05/2022 06:05");
  });

  // it('should set the utc preview value and change the timestamp', () => {
  //   const response = "2022-05-05T07:05:00";

  //   let timezoneSpy = spyOn(component.timezonesService, 'convertTimezone').and.returnValue(
  //       of(response)
  //   );

  //   component.previewUTC(component.form.controls["instrument_status"].controls[0]);
  //   fixture.detectChanges();

    
  //   expect(timezoneSpy).toHaveBeenCalled();
  //   expect(
  //     component.form.controls["instrument_status"].controls[0].controls["time_stamp"]).toEqual("2022-05-05T07:05:00");
  //   expect(
  //     component.form.controls["instrument_status"].controls[0].controls["utc_preview"]).toEqual("2022-05-05T07:05:00");
  // });

  it('should change vented form control value', () => {
    component.initForm();

    component.ventedChange("Yes");
    fixture.detectChanges();
    expect(component.form.controls["vented"].value).toEqual("Yes");
  });

  it('should change interval unit', () => {
    component.initForm();

    component.intervalUnitChange("min");
    fixture.detectChanges();
    expect(component.interval_unit).toEqual("min");
  });
});
