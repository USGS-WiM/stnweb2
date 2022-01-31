import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SensorEditComponent } from './sensor-edit.component';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray, FormGroup } from '@angular/forms';

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
      sensor_brand_id: 1,
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
      imports: [MatDialogModule, HttpClientTestingModule, MatTableModule, NoopAnimationsModule,],      
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

  it('should set the event lookup', () => {
    const response: any[] = [{event_id: 0, event_name: "test"}];

    spyOn(component.eventService, 'getAllEvents').and.returnValue(
        of(response)
    );

    component.getEventList();
    fixture.detectChanges();
    expect(component.events).toEqual(response);
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
    let confirmSpy = spyOn(component.dialog, 'open')
     .and
     .returnValue({afterClosed: () => of(true)} as MatDialogRef<unknown>);
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

  it('should set the utc preview value and change the timestamp', () => {
    component.setTimeAndDate();
    component.initForm();
    component.previewUTC(component.sensor.instrument_status[0]);
    fixture.detectChanges();

    expect(
      component.form.controls["instrument_status"].controls[0].controls["time_stamp"].value).toEqual("2022-01-05T01:05:00");
    expect(
      component.sensor.instrument_status[0].utc_preview).toEqual("01/05/2022 01:05");
  });

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

  it('should reset the lost form to initial values', () => {
    const opMeasurementResponse = [{ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];
    spyOn(component.siteService, 'getOPMeasurements').and.returnValue(
      of(opMeasurementResponse)
    );
    const opInfoResponse = {name: "testOP", elev_ft: 1};
    spyOn(component.siteService, 'getOPInfo').and.returnValue(
      of(opInfoResponse)
    );
    component.createTapedownTable();
    component.initForm();
    component.form.controls.lostRefMarks.setValue("testRefMark");
    component.form.controls["instrument_status"].controls[0].controls["notes"].setValue("test2");
    component.form.controls["lostTapedowns"].controls[0].controls["ground_surface"].setValue("8");
    component.cancelForm("Lost");

    fixture.detectChanges();
    expect(component.form.controls.lostRefMarks.value).toEqual(["testOP"]);
    expect(component.form.controls["instrument_status"].controls[0].controls["notes"].value).toEqual("test");
    expect(component.form.controls["lostTapedowns"].controls[0].controls["ground_surface"].value).toEqual(1);
  });

  it('should reset the deployed form to initial values', () => {
    component.sensor.instrument_status[0].status_type_id = 1;
    component.sensor.instrument_status[0].status = "Deployed";
    component.sensor.statusType = "Deployed";

    const opMeasurementResponse = [{ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];
    spyOn(component.siteService, 'getOPMeasurements').and.returnValue(
      of(opMeasurementResponse)
    );
    const opInfoResponse = {name: "testOP", elev_ft: 1};
    spyOn(component.siteService, 'getOPInfo').and.returnValue(
      of(opInfoResponse)
    );

    component.createTapedownTable();
    component.initForm();
    component.form.controls.deployedRefMarks.setValue("testRefMark");
    component.form.controls["instrument_status"].controls[0].controls["notes"].setValue("test2");
    component.form.controls["deployedTapedowns"].controls[0].controls["ground_surface"].setValue("8");
    component.cancelForm("Deployed");

    fixture.detectChanges();
    expect(component.form.controls.deployedRefMarks.value).toEqual(["testOP"]);
    expect(component.form.controls["instrument_status"].controls[0].controls["notes"].value).toEqual("test");
    expect(component.form.controls["deployedTapedowns"].controls[0].controls["ground_surface"].value).toEqual(1);
  });

  it('should reset the retrieved form to initial values', () => {
    component.sensor.instrument_status[0].status_type_id = 2;
    component.sensor.instrument_status[0].status = "Retrieved";

    const opMeasurementResponse = [{ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];
    spyOn(component.siteService, 'getOPMeasurements').and.returnValue(
      of(opMeasurementResponse)
    );
    const opInfoResponse = {name: "testOP", elev_ft: 1};
    spyOn(component.siteService, 'getOPInfo').and.returnValue(
      of(opInfoResponse)
    );

    component.createTapedownTable();
    component.initForm();
    component.form.controls.retrievedRefMarks.setValue("testRefMark");
    component.form.controls["instrument_status"].controls[0].controls["notes"].setValue("test2");
    component.form.controls["retrievedTapedowns"].controls[0].controls["ground_surface"].setValue("8");
    component.cancelForm("Retrieved");

    fixture.detectChanges();
    expect(component.form.controls.retrievedRefMarks.value).toEqual(["testOP"]);
    expect(component.form.controls["instrument_status"].controls[0].controls["notes"].value).toEqual("test");
    expect(component.form.controls["retrievedTapedowns"].controls[0].controls["ground_surface"].value).toEqual(1);
  });

  it('should show alert and stop loading if instrument form is invalid', () => {
    component.form.get("serial_number").setValue(null);
    let dialogSpy = spyOn(component.dialog, 'open');

    component.submit("3");
    fixture.detectChanges();
    expect(component.form.valid).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should convert interval and send requests if instrument form is valid', () => {
    component.interval_unit = "min";    
    component.form.get("interval").setValue("1");

    let requestSpy = spyOn(component, 'sendRequests');

    component.submit("3");
    fixture.detectChanges();
    expect(component.form.valid).toBeTrue();
    expect(component.loading).toBeTrue();
    expect(requestSpy).toHaveBeenCalled();
    expect(component.form.get("interval").value).toEqual(60);
  });


  it('should create an array of tapedowns to add', () => {
    let initTapedowns = [{ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];
    let newTapedowns = [{ground_surface: 2, water_surface: 2, offset_correction: 2, op_measurements_id: 2, objective_point_id: 2}, {ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];

    let tapedownsToAdd = component.addTapedowns(initTapedowns, newTapedowns);
    fixture.detectChanges();
    expect(tapedownsToAdd).toEqual([newTapedowns[0]]);
  });

  it('should create an array of tapedowns to remove', () => {
    let initTapedowns = [{ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];
    let newTapedowns = [];

    let tapedownsToRemove = component.deleteTapedowns(initTapedowns, newTapedowns);
    fixture.detectChanges();
    expect(tapedownsToRemove).toEqual([1]);
  });

  it('should create an array of tapedowns to update', () => {
    let initTapedowns = [{ground_surface: 1, water_surface: 1, offset_correction: 1, op_measurements_id: 1, objective_point_id: 1}];
    let newTapedowns = [{ground_surface: 2, water_surface: 2, offset_correction: 2, op_measurements_id: 1, objective_point_id: 1}];

    let tapedownsToUpdate = component.updateTapedowns(initTapedowns, newTapedowns);
    fixture.detectChanges();
    expect(tapedownsToUpdate).toEqual(newTapedowns);
  });

  it('should remove deleted tapedowns', () => {
    let tapedownsToAdd = [];
    let tapedownsToUpdate = [];
    let tapedownsToRemove = [3];

    let removeSpy = spyOn(component.sensorEditService, 'deleteOPMeasure').and.returnValue(
      of(null)
    );
    let dialogSpy = spyOn(component.dialog, 'open');
    let updateSpy = spyOn(component.sensorEditService, 'updateOPMeasure');
    let addSpy = spyOn(component.sensorEditService, 'addOPMeasure');

    component.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
    fixture.detectChanges();

    expect(addSpy).not.toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(dialogSpy).not.toHaveBeenCalled();
  });

  it('should show alert if removing tapedowns fails', () => {
    let tapedownsToAdd = [];
    let tapedownsToUpdate = [];
    let tapedownsToRemove = [3];

    let dialogSpy = spyOn(component.dialog, 'open');
    let removeSpy = spyOn(component.sensorEditService, 'deleteOPMeasure').and.returnValue(
      of([])
    );
    
    component.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
    fixture.detectChanges();
    
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should submit updated tapedowns', () => {
    let tapedownsToUpdate = [{ground_surface: 2, water_surface: 2, offset_correction: 2, op_measurements_id: 2, instrument_status_id: 2, objective_point_id: 2}];
    let tapedownsToAdd = [];
    let tapedownsToRemove = [];

    let dialogSpy = spyOn(component.dialog, 'open');
    let removeSpy = spyOn(component.sensorEditService, 'deleteOPMeasure');
    let addSpy = spyOn(component.sensorEditService, 'addOPMeasure');

    let tapedownUpdateResponse = tapedownsToUpdate[0];

    let updateSpy = spyOn(component.sensorEditService, 'updateOPMeasure').and.returnValue(
      of(tapedownUpdateResponse)
    );

    component.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
    fixture.detectChanges();

    expect(addSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(dialogSpy).not.toHaveBeenCalled();
  });

  it('should show alert if updating tapedowns fails', () => {
    let tapedownsToAdd = [];
    let tapedownsToUpdate = [{ground_surface: 2, water_surface: 2, offset_correction: 2, op_measurements_id: 2, instrument_status_id: 2, objective_point_id: 2}];
    let tapedownsToRemove = [];

    let dialogSpy = spyOn(component.dialog, 'open');
    let updateSpy = spyOn(component.sensorEditService, 'updateOPMeasure').and.returnValue(
      of([])
    );

    component.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
    fixture.detectChanges();

    
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should submit new tapedowns', () => {
    let tapedownsToAdd = [{ground_surface: 2, water_surface: 2, offset_correction: 2, op_measurements_id: null, instrument_status_id: 2, objective_point_id: 2}];
    let tapedownsToUpdate = [];
    let tapedownsToRemove = [];

    let dialogSpy = spyOn(component.dialog, 'open');

    let tapedownAddResponse = {ground_surface: 2, water_surface: 2, offset_correction: 2, op_measurements_id: 2, instrument_status_id: 2, objective_point_id: 2};

    let addSpy = spyOn(component.sensorEditService, 'addOPMeasure').and.returnValue(
      of(tapedownAddResponse)
    );
    let removeSpy = spyOn(component.sensorEditService, 'deleteOPMeasure');
    let updateSpy = spyOn(component.sensorEditService, 'updateOPMeasure');

    component.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(dialogSpy).not.toHaveBeenCalled();
  });

  it('should show alert if adding tapedowns fails', () => {
    let tapedownsToAdd = [{ground_surface: 2, water_surface: 2, offset_correction: 2, op_measurements_id: null, instrument_status_id: 2, objective_point_id: 2}];
    let tapedownsToUpdate = [];
    let tapedownsToRemove = [];

    let dialogSpy = spyOn(component.dialog, 'open');
    let addSpy = spyOn(component.sensorEditService, 'addOPMeasure').and.returnValue(
      of([])
    );
    
    component.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should send requests and set return data to results', () => {
    let response = {
      instrument_id:1,
      sensor_type_id:1,
      deployment_type_id:1,
      location_description: "Test",
      serial_number:0,
      interval:0,
      site_id:0,
      event_id:0,
      inst_collection_id:1,
      housing_type_id:1,
      sensor_brand_id:1,
      instrument_status:[],
      data_files:[],
      files:[]
    };
    let statusResponse = {
      instrument_id: 1111,
        instrument_status_id: 11001,
        member_id: 1,
        notes: "test",
        status_type_id: 3,
        time_stamp: "2022-01-05T01:05:00",
        time_zone: "UTC",
    }
    let returnData = {
      instrument_id:1,
      sensor_type_id:1,
      deployment_type_id:1,
      location_description: "Test",
      serial_number:0,
      interval:0,
      site_id:0,
      event_id:0,
      eventName:"Test Event",
      inst_collection_id:1,
      housing_type_id:1,
      sensor_brand_id:1,
      housingType:"testHousing",
      sensorType:"testSensor",
      sensorBrand:"test",
      deploymentType:"test",
      instCollection:"test",
      statusType: "Lost",
      instrument_status:[{
        instrument_id: 1111,
        instrument_status_id: 11001,
        member_id: 1,
        notes: "test",
        status: "Lost",
        status_type_id: 3,
        time_stamp: "2022-01-05T01:05:00",
        time_zone: "UTC",
      }],
      data_files:[],
      files:[]
    }
    const sensorTypeResponse: any[] = [{sensor_type_id: 1, sensor: "testSensor"}];
    spyOn(component.sensorEditService, 'getSensorTypeLookup').and.returnValue(
      of(sensorTypeResponse)
    );

    const sensorBrandResponse: any[] = [{sensor_brand_id: 1, brand_name: "test"}];

    spyOn(component.sensorEditService, 'getSensorBrandLookup').and.returnValue(
        of(sensorBrandResponse)
    );

    const housingTypeResponse: any[] = [{housing_type_id: 1, type_name: "testHousing"}];

    spyOn(component.siteService, 'getAllHousingTypes').and.returnValue(
        of(housingTypeResponse)
    );

    const deploymentTypeResponse: any[] = [{deployment_type_id: 1, method: "test"}];

    spyOn(component.siteService, 'getDeploymentTypes').and.returnValue(
        of(deploymentTypeResponse)
    );

    const vDatumResponse: any[] = [{datum_id: 0, datum_name: "testDatum"}];

    spyOn(component.siteService, 'getVDatumLookup').and.returnValue(
        of(vDatumResponse)
    );

    const collectCondResponse: any[] = [{id: 1, condition: "test"}];

    spyOn(component.sensorEditService, 'getCollectConditions').and.returnValue(
        of(collectCondResponse)
    );

    let instrumentRequestSpy = spyOn(component.sensorEditService, 'putInstrument').and.returnValue(of(response));
    let instrumentStatusRequestSpy = spyOn(component.sensorEditService, 'putInstrumentStatus').and.returnValue(of(statusResponse));
    let tapedownSpy = spyOn(component, 'sendTapedownRequests');

    component.getSensorTypes();
    component.getSensorBrands();
    component.getHousingTypes();
    component.getDeploymentTypes();
    component.getVDatums();
    component.collectConditionLookup();
    component.sendRequests("3");
    fixture.detectChanges();

    expect(component.returnData).toEqual(returnData);
    expect(instrumentRequestSpy).toHaveBeenCalled();
    expect(instrumentStatusRequestSpy).toHaveBeenCalled();
    expect(tapedownSpy).toHaveBeenCalledTimes(1);
    expect(component.returnData.instrument_status[0]).toEqual(returnData.instrument_status[0]);
  });
});
