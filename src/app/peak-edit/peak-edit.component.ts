import { E } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { PeakEditService } from '@app/services/peak-edit.service';
import { SiteService } from '@app/services/site.service';
import { throwIfEmpty } from 'rxjs/operators';

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
  public hwmFiles;
  public creator;

  public hwmDetail;
  public sensorDetail;
  public dataFileDetail;
  public selectedHWMs = [];
  public removedHWMs = [];
  public isRetrieved = false;
  public needDF = false;
  
  public timeZones = ['UTC', 'PST/PDT', 'MST/MDT', 'CST/CDT', 'EST/EDT'];

  constructor(
    private dialogRef: MatDialogRef<PeakEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,    
    public peakEditService: PeakEditService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.peak = this.data.peak;
    this.sensors = this.data.siteSensors;
    this.hwms = this.data.siteHWMs;
    this.sensorFiles = this.data.sensorFiles;
    this.hwmFiles = this.data.hwmFiles;
    // Add boolean field to show/hide details of each hwm
    this.hideAllSensorDetails();
    this.hideAllHWMDetails();
    console.log(this.peak);
    console.log(this.data)

    this.getPeakSummary();
    this.getVDatums();
    this.getSensorFiles();
    this.getHWMFiles();
    this.getSelectedHWMs();
    this.getSelectedDataFiles();
    this.initForm();
  }

  // TODO
  // Get peak summary view in site details component instead?
  // Get only retrieved dates for sensors
  // Check initially selected sensor files
  // Get peak data files
  // Send requests
  // Validation
  // Layout

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
        // if(file.file_id === self.peak.){

        // }
      })
    })
  }

  hideAllSensorDetails() {
    let self = this;
    this.sensors.forEach(function(sensor, i){
      self.sensors[i].showSensorDetail = false;
    })
  }

  hideAllHWMDetails() {
    let self = this;
    this.hwms.forEach(function(hwm, i){
      self.hwms[i].showHWMDetail = false;
    });
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
          //  Add selected property
          file.selected = false;
          self.sensors[i].files.push(file);
        }
      })
    })
  }

  // Add files for each hwm into hwm array
  getHWMFiles() {
    let self = this;
    this.hwms.forEach(function(hwm, i){
      self.hwmFiles.forEach(function(file){
        if(file.hwm_id === hwm.hwm_id){
          //  Add selected property
          file.selected = false;
          self.hwms[i].files.push(file);
        }
      })
    })
  }

  getPeakSummary() {
    this.peakEditService.getPeakSummary(this.peak.peak_summary_id).subscribe((results) => {
      console.log(results)
      this.peak.is_peak_discharge_estimated = results.is_peak_discharge_estimated;
      this.peak.is_peak_estimated = results.is_peak_estimated;
      this.peak.is_peak_stage_estimated = results.is_peak_stage_estimated;
      this.peak.is_peak_time_estimated = results.is_peak_time_estimated;
      this.peak.member_id = results.member_id;
      this.peak.time_zone = results.time_zone;
      this.peak.calc_notes = results.calc_notes;
      this.peak.peak_stage = results.peak_stage;
      this.peak.vdatum_id = results.vdatum_id;
      this.peak.is_hag_estimated = results.is_hag_estimated;
      this.peak.height_above_gnd = results.height_above_gnd;
      this.peak.peak_discharge = results.peak_discharge;
      this.peak.data_files = results.data_files;
      
      this.setMembers();
    })
  }

  setMembers() {
    console.log(this.peak.member_id)
    this.siteService
    .getMemberName(this.peak.member_id)
    .subscribe((results) => {
      if(results.length > 0 || results.length === undefined){
        this.creator =  results.fname + " " + results.lname;
      }
    })
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
      is_peak_estimated: new FormControl(this.peak.is_peak_estimated !== undefined && this.peak.is_peak_estimated !== "" ? this.peak.is_peak_estimated : null),
      peak_discharge: new FormControl(this.peak.peak_discharge !== undefined && this.peak.peak_discharge !== "" ? this.peak.peak_discharge : null),
      time_zone: new FormControl(this.peak.time_zone !== undefined && this.peak.time_zone !== "" ? this.peak.time_zone : null),
      peak_stage: new FormControl(this.peak.peak_stage !== undefined && this.peak.peak_stage !== "" ? this.peak.peak_stage : null),
      height_above_gnd: new FormControl(this.peak.height_above_gnd !== undefined && this.peak.height_above_gnd !== "" ? this.peak.height_above_gnd : null),
      is_hag_estimated: new FormControl(this.peak.is_hag_estimated !== undefined && this.peak.is_hag_estimated !== "" ? this.peak.is_hag_estimated : null),
      aep: new FormControl(this.peak.aep !== undefined && this.peak.aep !== "" ? this.peak.aep : null),
      aep_lowci: new FormControl(this.peak.aep_lowci !== undefined && this.peak.aep_lowci !== "" ? this.peak.aep_lowci : null),
      aep_upperci: new FormControl(this.peak.aep_upperci !== undefined && this.peak.aep_upperci !== "" ? this.peak.aep_upperci : null),
      aep_aep_range: new FormControl(this.peak.aep_aep_range !== undefined && this.peak.aep_aep_range !== "" ? this.peak.aep_aep_range : null),
      elev_ft: new FormControl(this.peak.elev_ft !== undefined && this.peak.elev_ft !== "" ? this.peak.elev_ft : null),
      vdatum_id: new FormControl(this.peak.vdatum_id !== undefined && this.peak.vdatum_id !== "" ? this.peak.vdatum_id : null, Validators.required),
      site_id: new FormControl(this.data.site_id !== undefined && this.data.site_id !== "" ? this.data.site_id : null),
      member_id: new FormControl(this.peak.member_id !== undefined && this.peak.member_id !== "" ? this.peak.member_id : null),
      calc_notes: new FormControl(this.peak.calc_notes !== undefined && this.peak.calc_notes !== "" ? this.peak.calc_notes : null)
    })
  }

  showHWMDetails(i) {
    this.hideAllSensorDetails();
    this.hwms[i].showHWMDetail = !this.hwms[i].showHWMDetail;
    this.dataFileDetail = false;
  }

  showSensorDetails(i) {
    this.hideAllHWMDetails();
    this.sensors[i].showSensorDetail = !this.sensors[i].showSensorDetail;
    this.dataFileDetail = false;
  }

  closeDetail() {
    this.hideAllSensorDetails();
    this.hideAllHWMDetails();
    this.dataFileDetail = false;
  }

  showIncompleteHWMInfo() {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: "Incomplete HWM",
        titleIcon: "",
        message: "Survey date and elevation are required in order to use as primary in the Peak summary. Please revisit the HWM and add Survey date and elevation if you want to use as primary. The HWM can be used for interpretation without a final elevation.",
        confirmButtonText: "OK",
        showCancelButton: false,
      },
    });
  }

  showDataFileDetails(j) {
    let file = this.sensors.files[j];
    this.siteService.getDataFile(file.data_file_id).subscribe((results) => {
      // this.DFBox = results;
      // this.DFBox.filePath = file.path;
      // this.DFBox.fileID = file.file_id;
      // this.DFBox.fileDesc = file.description;
      // this.DFBox.processedBy = allMembers.filter(function (m) { return m.member_id == response.processor_id; })[0];
      // Get member
      // this.DFBox.nwisFile = file.is_nwis == 1 ? true : false;
      // this.DFBox.fileURL = file.name;
      this.hideAllSensorDetails();
      this.hideAllHWMDetails();
    });
  }

  addDataFile(file) {
    this.siteService.getDataFile(file.data_file_id).subscribe((results) => {
    });
  }

  showIncompleteDFInfo() {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: "Incomplete Data File",
        titleIcon: "",
        message: "All RDGs, Met Station, and Rain Gage sensors require data file information in order to use as primary in the Peak summary. Please revisit the Retrieved Sensor and click on NWIS Data Connection to add a link to the NWIS data if you want to use as primary.",
        confirmButtonText: "OK",
        showCancelButton: false,
      },
    });
  }

  showRetrieveInfo() {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: "Deployed Sensor",
        titleIcon: "",
        message: "This sensor needs to be retrieved before a Peak can be created.",
        confirmButtonText: "OK",
        showCancelButton: false,
      },
    });
  }

  //add or remove a hwm from the list of chosen hwms for determining this peak
  addHWM(hwm) {
    if (hwm.selected) {
      this.selectedHWMs.push(hwm);
    } else {
        // Need to store removed ones for PUT
        if (this.peak.peak_summary_id !== undefined) {
            this.removedHWMs.push(hwm);
        }
        // Remove from selected HWMs
        if (this.selectedHWMs.length > 0) {
            let index = this.selectedHWMs.map(function (hwm) { return hwm.hwm_id; }).indexOf(hwm.hwm_id);
            this.selectedHWMs.splice(index, 1);
        }
    }
  }

  primaryHWM(hwm) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: "Set as Primary",
        titleIcon: "",
        message: "Are you sure you want to set this as the Primary HWM? Doing so will populate the Peak Date (not including time), Stage, Vertical Datum and Height Above Ground.",
        confirmButtonText: "OK",
        showCancelButton: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      // Confirm returns true
      if(result){
        this.peak.peak_date = new Date(hwm.flag_date);
        this.peak.peak_stage = hwm.elev_ft;
        this.peak.vdatum_id = hwm.vdatum_id;
        this.peak.height_above_gnd = hwm.height_above_gnd;
        // let hIndex = this.eventSiteHWMs.indexOf(hwm);
        // this.eventSiteHWMs[hIndex].selected = true;
      }
    })
  }

  primaryDataFile(file) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: "Set as Primary",
        titleIcon: "",
        message: "Are you sure you want to set this as the Primary Data file? (Coming soon: Script processing to populate the Peak date, time and time zone, Stage, Vertical Datum and Height above ground)",
        confirmButtonText: "OK",
        showCancelButton: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      // Confirm returns true
      if(result){
        console.log(result)
        // let sens = this.eventSiteSensors.filter(function (s) { return s.instrument_id == file.instrument_id; })[0];
        // let sIndex = this.eventSiteSensors.indexOf(sens);
        // let fIndex = sens.files.indexOf(file);
        // this.eventSiteSensors[sIndex].files[fIndex].selected = true;
      }
    })
  }

  submit() {

  }

}
