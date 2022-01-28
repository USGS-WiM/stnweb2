import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PeakEditComponent } from './peak-edit.component';
import { MatTableModule } from '@angular/material/table';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PeakEditComponent', () => {
  let component: PeakEditComponent;
  let fixture: ComponentFixture<PeakEditComponent>;

  const dialogMock = {
    close: () => {},
  };

  let data = {
    peak: {
      event_name: "Test Event",
      format_peak_date: "01/26/2022",
      latitude: 39,
      longitude: -90,
      peak_date: "2022-01-26T01:10:00",
      peak_summary_id: 100,
      site_id: 101010,
    },
    siteSensors: [
      {
        data_files: [],
        deploymentType: "TestDepType",
        deployment_type_id: 1,
        eventName: "Test Event",
        event_id: 0,
        files: [],
        housingType: "Test Housing Type",
        housing_type_id: 1,
        instCollection: "Fresh Water",
        inst_collection_id: 1,
        instrument_id: 0,
        instrument_status: [
          {
            instrument_id: 1,
            instrument_status_id: 1,
            member_id: 0,
            status: "Deployed",
            status_type_id: 0,
            time_stamp:  "2022-01-25T01:00:00",
            time_zone: "UTC",
            vdatum: 0,
          },
          {
            instrument_id: 0,
            instrument_status_id: 0,
            member_id: 0,
            status: "Retrieved",
            status_type_id: 0,
            time_stamp:  "2022-01-25T02:00:00",
            time_zone: "UTC",
            vdatum: 0,
          }
        ],
        interval: 0,
        location_description: "test",
        sensorBrand: "Test Brand",
        sensorType: "Test Type",
        sensor_brand_id: 1,
        sensor_type_id: 6,
        serial_number: "010101",
        site_id: 101010,
        statusType: "Retrieved",
      }
    ],
    siteHWMs: [
      {
        approval_id: 1,
        bank: "Right",
        elev_ft: 10,
        eventName: "Test Event",
        event_id: 1,
        files: [],
        flag_date: "2022-01-25T01:11:00",
        flag_member_id: 1,
        format_flag_date: "01/25/2022",
        hcollect_method_id: 1,
        hdatum_id: 1,
        height_above_gnd: 10,
        hwm_environment: "Coastal",
        hwm_id: 100,
        hwm_label: "test",
        hwm_locationdescription: "test",
        hwm_notes: "test",
        hwm_quality_id: 1,
        hwm_type_id: 1,
        hwm_uncertainty: 1,
        latitude_dd: 35,
        longitude_dd: -90,
        marker_id: 1,
        peak_summary_id: 100,
        site_id: 101010,
        stillwater: 0,
        survey_date: "2022-01-25T01:10:00",
        survey_member_id: 0,
        uncertainty: 0,
        vcollect_method_id: 1,
        vdatum_id: 1,
        waterbody: "test",
      }
    ],
    sensorFiles: [
      {
        data_file_id: 0,
        description: "test",
        details: {
          instrument_id: 0,
        },
        file_date: "2022-01-25T01:10:00",
        file_id: 100,
        filetype_id: 2,
        format_file_date: "01/25/2022",
        instrument_id: 0,
        name: "Test",
        path: "test/test.txt",
        site_id: 101010,
      }
    ],
    hwmFiles: [
      {
        description: "Test",
        file_date: "2022-01-25T01:10:00",
        file_id: 1,
        filetype_id: 2,
        format_file_date: "01/25/2022",
        hwm_id: 0,
        name: "test2.txt",
        path: "test/test2.txt",
        photo_date: "2022-01-24T01:10:00",
        site_id: 101010,
        source_id: 0,
      }
    ],
    site_id: 101010,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeakEditComponent ],
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
    fixture = TestBed.createComponent(PeakEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the peak member name', () => {
    const response = {member_id: 0, fname: "John", lname: "Smith"};

    spyOn(component.siteService, 'getMemberName').and.returnValue(
        of(response)
    );

    component.setMembers();
    fixture.detectChanges();
    expect(component.creator).toEqual("John Smith");
  });

  it('should get peak data files', () => {
    const response = [{data_file_id: 0}, {data_file_id: 0}];

    spyOn(component.peakEditService, 'getPeakDataFiles').and.returnValue(
        of(response)
    );
    let selectedDFSpy = spyOn(component, 'getSelectedDataFiles');

    component.getPeakDataFiles();
    fixture.detectChanges();
    expect(component.peakDFs).toEqual(response);
    expect(selectedDFSpy).toHaveBeenCalled();
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

  it('should set the instrument status array order', () => {
    component.reorderInstruments();
    fixture.detectChanges();
    expect(component.sensors[0].instrument_status[0].status).toEqual("Retrieved");
    expect(component.sensors[0].needsDF).not.toBeTrue();
    expect(component.sensors[0].isRetrieved).toBeTrue();
  });

  it('should set the peak time and date', () => {
    component.setPeakTimeAndDate();
    fixture.detectChanges();
    expect(component.peak.minute).toEqual("10");
    expect(component.peak.hour).toEqual("01");
    expect(component.peak.utc_preview).toEqual("01/26/2022 01:10");
  });

  it('should set a time and date', () => {
    let timestamp = "2022-01-25T01:00:00";
    let timeResult = component.setTimeAndDate(timestamp);
    fixture.detectChanges();
    expect(timeResult).toEqual("01/25/2022 01:00 AM");
  });

  it('should convert a time and date to UTC', () => {
    component.form.controls.time_zone.setValue("EST/EDT");
    component.previewUTC();
    fixture.detectChanges();
    expect(component.peak.utc_preview).toEqual("01/26/2022 06:10");
  });

  it('should change the timezone', () => {
    component.form.controls.time_zone.setValue("EST/EDT");
    let timezone = "UTC";
    let previewUTCSpy = spyOn(component, 'previewUTC');

    component.setTimeZone(timezone);
    fixture.detectChanges();
    expect(component.form.controls.time_zone.value).toEqual("UTC");
    expect(previewUTCSpy).toHaveBeenCalled();
  });

  it('should change the time from AM to PM', () => {
    component.peak.ampm = "AM";
    let previewUTCSpy = spyOn(component, 'previewUTC');

    component.changeTime();
    fixture.detectChanges();
    expect(component.peak.ampm).toEqual("PM");
    expect(previewUTCSpy).toHaveBeenCalled();
  });

  it('should return false if a data file is not present', () => {
    let hasDF = component.determineDFPresent(data.sensorFiles);
    fixture.detectChanges();
    expect(hasDF).toBeTrue();

    data.sensorFiles[0].filetype_id = 0;
    hasDF = component.determineDFPresent(data.sensorFiles);
    fixture.detectChanges();
    expect(hasDF).toBeFalse();

    // Reset the filetype_id
    data.sensorFiles[0].filetype_id = 2;
  });

  it('should set selected HWMs', () => {
    component.getSelectedHWMs();
    fixture.detectChanges();
    expect(component.hwms[0].selected).toBeTrue();

    component.hwms[0].peak_summary_id = null;
    component.getSelectedHWMs();
    fixture.detectChanges();
    expect(component.hwms[0].selected).toBeFalse();
  });

  it('should set selected data files', () => {
    component.peakDFs = [];
    component.getSelectedDataFiles();
    fixture.detectChanges();
    expect(component.sensors[0].files[0].selected).toBeFalse();

    
    component.peakDFs = [{data_file_id: 0}];
    component.getSelectedDataFiles();
    fixture.detectChanges();
    expect(component.sensors[0].files[0].selected).toBeTrue();
  });

  it('should set peak attributes', () => {
    const response = {
      peak_summary_id: 100,
      member_id: 0,
      peak_date: "2022-01-26T01:10:00",
      is_peak_estimated: 1,
      is_peak_time_estimated: 0,
      peak_stage: 1,
      is_peak_stage_estimated: 0,
      is_peak_discharge_estimated: 0,
      vdatum_id: 1,
      time_zone: "EDT",
    };
    spyOn(component.peakEditService, 'getPeakSummary').and.returnValue(
      of(response)
    );
    let memberSpy = spyOn(component, 'setMembers');
    let previewUTCSpy = spyOn(component, 'previewUTC');

    component.getPeakSummary();
    fixture.detectChanges();
    expect(component.form.controls.peak_stage.value).toEqual(1);
    expect(component.form.controls.is_peak_estimated.value).toBeTrue();
    expect(component.form.controls.is_peak_time_estimated.value).toBeFalse();
    expect(memberSpy).toHaveBeenCalled();
    expect(previewUTCSpy).toHaveBeenCalled();
  });

  it('should show selected hwm details and hide all other hwm, sensor and df details', () => {
    component.sensors[0].showSensorDetail = true;
    component.showHWMDetails(0);
    fixture.detectChanges();
    expect(component.sensors[0].showSensorDetail).toBeFalse();
    expect(component.hwms[0].showHWMDetail).toBeTrue();
  });

  it('should show selected sensor details and hide all other sensor, hwm and df details', () => {
    component.hwms[0].showHWMDetail = true;
    component.showSensorDetails(0);
    fixture.detectChanges();
    expect(component.sensors[0].showSensorDetail).toBeTrue();
    expect(component.hwms[0].showHWMDetail).toBeFalse();
  });

  it('should show selected df details and hide all other sensor, hwm and df details', () => {
    component.hwms[0].showHWMDetail = true;
    const memberName = {member_id: 0, fname: "John", lname: "Smith"};
    const response = {
      data_file_id: 0,
      good_start: "2022-01-26T01:00:00",
      good_end: "2022-01-26T02:00:00",
      processor_id: 0,
      approval_id: 0,
      collect_date: "2022-01-27T02:00:00",
      time_zone: "UTC"
    };
    spyOn(component.siteService, 'getDataFile').and.returnValue(
      of(response)
    );
    spyOn(component.siteService, 'getMemberName').and.returnValue(
      of(memberName)
    );
    component.showDataFileDetails(component.sensors[0].files[0]);
    fixture.detectChanges();
    expect(component.sensors[0].files[0].showDFDetail).toBeTrue();
    expect(component.hwms[0].showHWMDetail).toBeFalse();
  });

  it('should close all detail sections', () => {
    component.sensors[0].showSensorDetail = true;
    component.hwms[0].showSensorDetail = true;
    component.sensors[0].files[0].showDFDetail = true;
    component.closeDetail();
    fixture.detectChanges();
    expect(component.sensors[0].showSensorDetail).toBeFalse();
    expect(component.hwms[0].showHWMDetail).toBeFalse();
    expect(component.sensors[0].files[0].showDFDetail).toBeFalse();
  });

  it('should add a data file to the list of dfs to update', () => {
    component.sensors[0].files[0].selected = true;
    const response = {
      data_file_id: 0,
      good_start: "2022-01-26T01:00:00",
      good_end: "2022-01-26T02:00:00",
      processor_id: 0,
      approval_id: 0,
      collect_date: "2022-01-27T02:00:00",
      time_zone: "UTC"
    };
    spyOn(component.siteService, 'getDataFile').and.returnValue(
      of(response)
    );
    component.addDataFile(component.sensors[0].files[0]);
    fixture.detectChanges();
    expect(component.selectedDFs.length).toEqual(1);
  });

  it('should remove a data file from the list of dfs to update', () => {
    component.sensors[0].files[0].selected = false;
    component.selectedDFs = [component.sensors[0].files[0]];
    const response = {
      data_file_id: 0,
      good_start: "2022-01-26T01:00:00",
      good_end: "2022-01-26T02:00:00",
      processor_id: 0,
      approval_id: 0,
      collect_date: "2022-01-27T02:00:00",
      time_zone: "UTC"
    };
    spyOn(component.siteService, 'getDataFile').and.returnValue(
      of(response)
    );
    component.addDataFile(component.sensors[0].files[0]);
    fixture.detectChanges();
    expect(component.selectedDFs.length).toEqual(0);
  });

  it('should add a data file to the list of dfs to remove', () => {
    component.sensors[0].files[0].selected = false;
    component.selectedDFs = [component.sensors[0].files[0]];
    const response = {
      data_file_id: 0,
      good_start: "2022-01-26T01:00:00",
      good_end: "2022-01-26T02:00:00",
      processor_id: 0,
      approval_id: 0,
      collect_date: "2022-01-27T02:00:00",
      time_zone: "UTC",
      peak_summary_id: 100,
    };
    spyOn(component.siteService, 'getDataFile').and.returnValue(
      of(response)
    );
    component.addDataFile(component.sensors[0].files[0]);
    fixture.detectChanges();
    expect(component.removedDFs.length).toEqual(1);
  });

  it('should remove a data file from the list of dfs to remove', () => {
    component.sensors[0].files[0].selected = true;
    component.selectedDFs = [component.sensors[0].files[0]];
    const response = {
      data_file_id: 0,
      good_start: "2022-01-26T01:00:00",
      good_end: "2022-01-26T02:00:00",
      processor_id: 0,
      approval_id: 0,
      collect_date: "2022-01-27T02:00:00",
      time_zone: "UTC",
      peak_summary_id: 100,
    };
    spyOn(component.siteService, 'getDataFile').and.returnValue(
      of(response)
    );
    component.addDataFile(component.sensors[0].files[0]);
    fixture.detectChanges();
    expect(component.removedDFs.length).toEqual(0);
  });

  it('should add a hwm to the list of hwms to update', () => {
    component.hwms[0].selected = true;
    component.hwms[0].peak_summary_id = undefined;
    component.addHWM(component.hwms[0]);
    fixture.detectChanges();
    expect(component.selectedHWMs.length).toEqual(1);
  });

  it('should add a hwm to the list of hwms to remove', () => {
    component.hwms[0].selected = false;
    component.addHWM(component.hwms[0]);
    fixture.detectChanges();
    expect(component.removedHWMs.length).toEqual(1);
  });

  it('should remove a hwm from the list of hwms to update', () => {
    component.hwms[0].selected = false;
    component.selectedHWMs = [component.hwms[0]];
    component.hwms[0].peak_summary_id = undefined;
    component.addHWM(component.hwms[0]);
    fixture.detectChanges();
    expect(component.selectedHWMs.length).toEqual(0);
    expect(component.removedHWMs.length).toEqual(0);
  });

  it('should remove a hwm from the list of hwms to remove', () => {
    component.hwms[0].selected = true;
    component.removedHWMs = [component.hwms[0]];
    component.addHWM(component.hwms[0]);
    fixture.detectChanges();
    expect(component.removedHWMs.length).toEqual(0);
    expect(component.selectedHWMs.length).toEqual(0);
  });

  it('should alert the user if form is invalid on submit', () => {
    component.form.controls.peak_date.setValue(null);
    spyOn(window, 'alert');
    component.submit();
    fixture.detectChanges();
    expect(component.form.valid).toBeFalse();
    expect(component.loading).toBeFalse();
    expect(window.alert).toHaveBeenCalledWith("Some required Peak fields are missing or incorrect.  Please fix these fields before submitting.");
  });

  it('should start loading and send requests if form is valid on submit', () => {
    component.form.controls.time_zone.setValue('UTC');
    let sendRequests = spyOn(component, 'sendRequests');

    component.submit();
    fixture.detectChanges();
    expect(component.form.valid).toBeTrue();
    expect(component.loading).toBeTrue();
    expect(sendRequests).toHaveBeenCalled();
  });

  it('should send requests', () => {
    component.form.controls.time_zone.setValue('UTC');
    const response = {
      latitude: 39,
      longitude: -90,
      peak_date: "2022-01-26T01:10:00",
      peak_summary_id: 100,
      site_id: 101010,
    };

    const returnValue = {
      format_peak_date: "01/26/2022",
      latitude: 39,
      longitude: -90,
      peak_date: "2022-01-26T01:10:00",
      peak_summary_id: 100,
      site_id: 101010,
    };

    const removedDF = {
      data_file_id: 0,
        description: "test",
        details: {
          instrument_id: 0,
        },
        file_date: "2022-01-25T01:10:00",
        file_id: 100,
        filetype_id: 2,
        format_file_date: "01/25/2022",
        instrument_id: 0,
        name: "Test",
        path: "test/test.txt",
        site_id: 101010,
    }

    const selectedHWM = {
      approval_id: 1,
      bank: "Right",
      elev_ft: 10,
      eventName: "Test Event",
      event_id: 1,
      files: [],
      flag_date: "2022-01-25T01:11:00",
      flag_member_id: 1,
      format_flag_date: "01/25/2022",
      hcollect_method_id: 1,
      hdatum_id: 1,
      height_above_gnd: 10,
      hwm_environment: "Coastal",
      hwm_id: 101,
      hwm_label: "test",
      hwm_locationdescription: "test",
      hwm_notes: "test",
      hwm_quality_id: 1,
      hwm_type_id: 1,
      hwm_uncertainty: 1,
      latitude_dd: 35,
      longitude_dd: -90,
      marker_id: 1,
      site_id: 101010,
      stillwater: 0,
      survey_date: "2022-01-25T01:10:00",
      survey_member_id: 0,
      uncertainty: 0,
      vcollect_method_id: 1,
      vdatum_id: 1,
      waterbody: "test",
    }

    const hwmResponse = {
      approval_id: 1,
      bank: "Right",
      elev_ft: 10,
      eventName: "Test Event",
      event_id: 1,
      files: [],
      flag_date: "2022-01-25T01:11:00",
      flag_member_id: 1,
      format_flag_date: "01/25/2022",
      hcollect_method_id: 1,
      hdatum_id: 1,
      height_above_gnd: 10,
      hwm_environment: "Coastal",
      hwm_id: 101,
      hwm_label: "test",
      hwm_locationdescription: "test",
      hwm_notes: "test",
      hwm_quality_id: 1,
      hwm_type_id: 1,
      hwm_uncertainty: 1,
      latitude_dd: 35,
      longitude_dd: -90,
      marker_id: 1,
      peak_summary_id: 100,
      site_id: 101010,
      stillwater: 0,
      survey_date: "2022-01-25T01:10:00",
      survey_member_id: 0,
      uncertainty: 0,
      vcollect_method_id: 1,
      vdatum_id: 1,
      waterbody: "test",
    }

    component.removedDFs = [removedDF];
    component.selectedHWMs = [selectedHWM];

    spyOn(component.peakEditService, 'putPeak').and.returnValue(of(response));
    spyOn(component.peakEditService, 'updateHWM').and.returnValue(of(hwmResponse));
    let updateDFSpy = spyOn(component.peakEditService, 'updateDF').and.returnValue(of([0]));
    
    component.sendRequests();
    fixture.detectChanges();
    expect(component.returnData.peak).toEqual(returnValue);
    expect(component.returnData.hwmsToAdd).toEqual([hwmResponse.hwm_id]);
    expect(updateDFSpy).toHaveBeenCalledTimes(1);

  });
});