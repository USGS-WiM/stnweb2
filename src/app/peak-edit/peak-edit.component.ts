import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-peak-edit',
  templateUrl: './peak-edit.component.html',
  styleUrls: ['./peak-edit.component.scss']
})
export class PeakEditComponent implements OnInit {

  public peak;
  public vdatums;
  public form;
  public sensors;
  public sensorFiles;
  public hwms;
  
  public timeZones = ['UTC', 'PST/PDT', 'MST/MDT', 'CST/CDT', 'EST/EDT'];

  constructor(
    private dialogRef: MatDialogRef<PeakEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    this.peak = this.data.peak;
    this.sensors = this.data.siteSensors;
    this.hwms = this.data.siteHWMs;
    this.sensorFiles = this.data.sensorFiles;
    console.log(this.peak);
    console.log(this.data)

    this.getVDatums();
    this.getSensorFiles();
    this.getPeakSummary();
    this.initForm();
  }

  getVDatums() {
    this.siteService
    .getVDatumLookup()
    .subscribe((results) => {
      this.vdatums = results;
    });
  }

  // Add files for each sensor into sensor array
  getSensorFiles() {
    let self = this;
    this.sensors.forEach(function(sensor, i){
      self.sensorFiles.forEach(function(file){
        if(file.details.instrument_id === sensor.instrument_id){
          self.sensors[i].files.push(file);
        }
      })
    })
  }

  getPeakSummary() {

  }

  initForm() {
    this.form = new FormGroup({
      hwm: new FormControl(this.peak.hwm !== undefined && this.peak.hwm !== "" ? this.peak.hwm : null),
      sensor: new FormControl(this.peak.sensor !== undefined && this.peak.sensor !== "" ? this.peak.sensor : null),
      is_peak_discharge_estimated: new FormControl(this.peak.is_peak_discharge_estimated !== undefined && this.peak.is_peak_discharge_estimated !== "" ? this.peak.is_peak_discharge_estimated : null),
      peak_summary_id: new FormControl(this.peak.peak_summary_id !== undefined && this.peak.peak_summary_id !== "" ? this.peak.peak_summary_id : null),
      peak_date: new FormControl(this.peak.peak_date !== undefined && this.peak.peak_date !== "" ? this.peak.peak_date : null),
      is_peak_time_estimated: new FormControl(this.peak.is_peak_time_estimated !== undefined && this.peak.is_peak_time_estimated !== "" ? this.peak.is_peak_time_estimated : null),
      is_peak_stage_estimated: new FormControl(this.peak.is_peak_stage_estimated !== undefined && this.peak.is_peak_stage_estimated !== "" ? this.peak.is_peak_stage_estimated : null),
      time_zone: new FormControl(this.peak.time_zone !== undefined && this.peak.time_zone !== "" ? this.peak.time_zone : null),
      peak_stage: new FormControl(this.peak.peak_stage !== undefined && this.peak.peak_stage !== "" ? this.peak.peak_stage : null),
      height_above_gnd: new FormControl(this.peak.height_above_gnd !== undefined && this.peak.height_above_gnd !== "" ? this.peak.height_above_gnd : null),
      height_above_gnd_estimated: new FormControl(this.peak.height_above_gnd_estimated !== undefined && this.peak.height_above_gnd_estimated !== "" ? this.peak.height_above_gnd_estimated : null),
      aep: new FormControl(this.peak.aep !== undefined && this.peak.aep !== "" ? this.peak.aep : null),
      aep_lower_limit: new FormControl(this.peak.aep_lower_limit !== undefined && this.peak.aep_lower_limit !== "" ? this.peak.aep_lower_limit : null),
      aep_upper_limit: new FormControl(this.peak.aep_upper_limit !== undefined && this.peak.aep_upper_limit !== "" ? this.peak.aep_upper_limit : null),
      aep_percentage: new FormControl(this.peak.aep_percentage !== undefined && this.peak.aep_percentage !== "" ? this.peak.aep_percentage : null),
      elev_ft: new FormControl(this.peak.elev_ft !== undefined && this.peak.elev_ft !== "" ? this.peak.elev_ft : null),
      vdatum_id: new FormControl(this.peak.vdatum_id !== undefined && this.peak.vdatum_id !== "" ? this.peak.vdatum_id : null, Validators.required),
      site_id: new FormControl(this.data.site_id !== undefined && this.data.site_id !== "" ? this.data.site_id : null),
      member_id: new FormControl(this.peak.member_id !== undefined && this.peak.member_id !== "" ? this.peak.member_id : null),
      calc_notes: new FormControl(this.peak.calc_notes !== undefined && this.peak.calc_notes !== "" ? this.peak.calc_notes : null)
    })
  }

}
