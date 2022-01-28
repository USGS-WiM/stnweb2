import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { PeakDialogComponent } from './peak-dialog.component';

describe('PeakDialogComponent', () => {
  let component: PeakDialogComponent;
  let fixture: ComponentFixture<PeakDialogComponent>;

  const data = 
    { peak: {
        event_name: "Test Event",
        format_peak_date: "01/26/2022",
        latitude: 39,
        longitude: -90,
        peak_date: "2022-01-26T01:10:00",
        peak_summary_id: 100,
        site_id: 101010,
      },
      sensors: [
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
      hwms: [
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
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeakDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatExpansionModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeakDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getVDatum and set vdatum', () => {
    const response = {datum_name: "NADV88"};
    spyOn(component.siteService, 'getVDatum').and.returnValue(
        of(response)
    );
    component.setVDatum();
    fixture.detectChanges();
    expect(component.vdatum).toEqual("NADV88");
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
    let vdatumSpy = spyOn(component, 'setVDatum');

    component.getPeakSummary();
    fixture.detectChanges();
    expect(component.peak.peak_stage).toEqual(1);
    expect(component.peak.is_peak_estimated).toEqual("Yes");
    expect(component.peak.is_peak_time_estimated).toEqual("No");
    expect(memberSpy).toHaveBeenCalled();
    expect(vdatumSpy).toHaveBeenCalled();
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
});
