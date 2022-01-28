import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PeakEditService } from '@app/services/peak-edit.service';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-peak-dialog',
  templateUrl: './peak-dialog.component.html',
  styleUrls: ['./peak-dialog.component.scss']
})
export class PeakDialogComponent implements OnInit {

  public peak;
  public sensors;
  public hwms;
  public vdatum;
  public creator;
  public peakDFs;
  
  infoExpanded = true;
  filesExpanded = false;

  constructor(
    private dialogRef: MatDialogRef<PeakDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
    public peakEditService: PeakEditService,
  ) { }

  ngOnInit(): void {
    this.peak = JSON.parse(JSON.stringify(this.data.peak));
    this.sensors = JSON.parse(JSON.stringify(this.data.sensors));
    this.hwms = JSON.parse(JSON.stringify(this.data.hwms));

    this.getPeakSummary();
    this.getPeakDataFiles();
    this.getSensorFiles();
    this.getSelectedHWMs();
  }

  setVDatum() {
    this.siteService
    .getVDatum(this.peak.vdatum_id)
    .subscribe((results) => {
      this.vdatum = results.datum_name;
    });
  }

  setMembers() {
      this.siteService
      .getMemberName(this.peak.member_id)
      .subscribe((results) => {
        if(results.length > 0 || results.length === undefined){
          this.creator = results.fname + " " + results.lname;
        }
      })
  }

  getPeakSummary() {
    this.peakEditService.getPeakSummary(this.peak.peak_summary_id).subscribe((results) => {
      this.peak.is_peak_discharge_estimated = results.is_peak_discharge_estimated === 1 ? "Yes" : "No";
      this.peak.is_peak_estimated = results.is_peak_estimated === 1 ? "Yes" : "No";
      this.peak.is_peak_stage_estimated = results.is_peak_stage_estimated === 1 ? "Yes" : "No";
      this.peak.is_peak_time_estimated = results.is_peak_time_estimated === 1 ? "Yes" : "No";
      this.peak.member_id = results.member_id;
      this.peak.time_zone = results.time_zone;
      this.peak.calc_notes = results.calc_notes;
      this.peak.peak_stage = results.peak_stage;
      this.peak.vdatum_id = results.vdatum_id;
      this.peak.is_hag_estimated = results.is_hag_estimated === 1 ? "Yes" : "No";
      this.peak.height_above_gnd = results.height_above_gnd;
      this.peak.peak_discharge = results.peak_discharge;
      this.peak.aep = results.aep;
      this.peak.aep_lowci = results.aep_lowci;
      this.peak.aep_upperci = results.aep_upperci;
      this.peak.aep_range = results.aep_range;
      if(this.peak.vdatum_id !== undefined){
        this.setVDatum();
      }
      this.setMembers();
    });
  }

  getPeakDataFiles() {
    this.peakEditService.getPeakDataFiles(this.peak.peak_summary_id).subscribe(results => {
      this.peakDFs = results;
      this.getSelectedDataFiles();
    })
  }

  // Add files for each sensor into sensor array
  getSensorFiles() {
    let self = this;
    this.sensors.forEach(function(sensor, i){
      self.data.sensorFiles.forEach(function(file){
        if(file.details.instrument_id === sensor.instrument_id){
          //  Add selected property
          file.selected = false;
          self.sensors[i].files.push(file);
        }
      })
    })
  }

  getSelectedHWMs() {
    let self = this;
    this.hwms.forEach(function(hwm, i){
      if(hwm.peak_summary_id === self.peak.peak_summary_id){
        self.hwms[i].selected = true;
      }else{
        self.hwms[i].selected = false;
      }
    })
  }

  getSelectedDataFiles() {
    let self = this;
    this.sensors.forEach(function(sensor, i){
      sensor.files.forEach(function(file, j){
        let matches = self.peakDFs.filter(function (pdf) { return pdf.data_file_id == file.data_file_id; })[0];
        if(matches){
          self.sensors[i].files[j].selected = true;
          self.sensors[i].selected = true;
        }
      })
    })
  }
}
