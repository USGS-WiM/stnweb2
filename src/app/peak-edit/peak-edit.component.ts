import { E, S } from '@angular/cdk/keycodes';
import { RecursiveTemplateAstVisitor } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { PeakEditService } from '@app/services/peak-edit.service';
import { SiteService } from '@app/services/site.service';
import { TimezonesService } from '@app/services/timezones.service';
import { DateTime } from "luxon";
import { SerialDisposable } from 'rx';
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
  public peakDFs = [];
  public df;

  public hwmDetail;
  public sensorDetail;
  public dataFileDetail;
  public selectedHWMs = [];
  public removedHWMs = [];
  public selectedDFs = [];
  public removedDFs = [];
  
  public timeZones = ['UTC', 'PST/PDT', 'MST/MDT', 'CST/CDT', 'EST/EDT'];

  public loading;
  public returnData = {
    peak: null,
    hwmsToRemove: [],
    hwmsToAdd: [],
  };

  editOrCreate;

  constructor(
    private dialogRef: MatDialogRef<PeakEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,    
    public peakEditService: PeakEditService,
    public timezonesService: TimezonesService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.peak = JSON.parse(JSON.stringify(this.data.peak));
    this.sensors = JSON.parse(JSON.stringify(this.data.siteSensors));
    this.hwms = JSON.parse(JSON.stringify(this.data.siteHWMs));
    this.sensorFiles = JSON.parse(JSON.stringify(this.data.sensorFiles));
    this.hwmFiles = JSON.parse(JSON.stringify(this.data.hwmFiles));

    // Add boolean field to show/hide details of each hwm
    this.hideAllSensorDetails();
    this.hideAllHWMDetails();
    this.getVDatums();
    this.getSensorFiles();
    this.getHWMFiles();

    if(this.peak !== null){
      this.editOrCreate = "Edit";
      this.setPeakTimeAndDate();
      this.getPeakSummary();
      this.getPeakDataFiles();
      this.reorderInstruments();
      this.getSelectedHWMs();
      this.initForm();
    }else{
      this.editOrCreate = "Create";
      let newDate = new Date();
      let isoDate = newDate.toISOString();
      let utcDate = newDate.toUTCString();
      this.peak = { 
        peak_date: isoDate, 
        member_id: JSON.parse(localStorage.getItem('currentUser')).member_id,
        utc_preview: utcDate,
        time_zone: "UTC",
      };
      this.setPeakTimeAndDate();
      this.setMembers();
      this.initForm();
    }
  }

  reorderInstruments() {
    let self = this;
    //need to make sure the instrument_statuses are in the correct order ([0]Retrieved, [1]Deployed, [2]Proposed                
    for (var s = 0; s < this.sensors.length; s++) {
      var correctOrderSS = [];
      var sensorStatuses = this.sensors[s].instrument_status;
      if (sensorStatuses.length > 1) {
          //only care about order if there's more than 1
          var proposedStat = sensorStatuses.filter(function (ps) { return ps.status == "Proposed"; })[0];
          var deployedStat = sensorStatuses.filter(function (ps) { return ps.status == "Deployed"; })[0];
          var retLostStat = sensorStatuses.filter(function (ps) { return ps.status == "Retrieved" || ps.status == "Lost"; })[0];
          //now add them back in correctly
          if (retLostStat) correctOrderSS.push(retLostStat);
          if (deployedStat) correctOrderSS.push(deployedStat);
          if (proposedStat) correctOrderSS.push(proposedStat);
      } else {
          correctOrderSS.push(sensorStatuses[0]);
      }
      //now put it back in the object
      this.sensors[s].instrument_status = [];
      this.sensors[s].instrument_status = correctOrderSS;

      //store if this is retrieved (if not, show ! for them to retrieve it in order to complete the peak
      this.sensors[s].isRetrieved = this.sensors[s].instrument_status[0].status == 'Retrieved' ? true : false;
      if (this.sensors[s].sensor_type_id == 2 || this.sensors[s].sensor_type_id == 5 || this.sensors[s].sensor_type_id == 6) {
        if (this.sensors[s].files.length === 0) this.sensors[s].needsDF = true;
        else {
            if (!this.determineDFPresent(this.sensors[s].files)) this.sensors[s].needsDF = true;
        }
      }
      // Format time/date
      sensorStatuses.forEach(function(status, i){
        let timestamp = self.setTimeAndDate(status.time_stamp);
        self.sensors[s].instrument_status[i].format_time_stamp = timestamp;
      })
    }
  }

  calcAMPM(hour) {
    if(hour > 12){
      hour = String(hour - 12).padStart(2, '0');
      return {ampm: "PM", hour: hour};
    }else{
      if(String(hour) === '00'){
        hour = '12';
        return {ampm: "AM", hour: hour};
      }else{
        hour = String(hour).padStart(2, '0');
        return {ampm: "AM", hour: hour};
      }
    }
  }

  setTimeAndDate(time_stamp) {
      let hour = (time_stamp.split('T')[1]).split(':')[0];
      let hourampmObj = this.calcAMPM(hour);
      hour = hourampmObj.hour;
      let ampm = hourampmObj.ampm;
      // minute
      let minute = time_stamp.split('T')[1].split(':')[1];
      minute = String(minute).padStart(2, '0');
      let timestamp = time_stamp.split("T")[0];
      timestamp = timestamp.split("-");
      timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + hour + ":" + minute + " " + ampm;
      return timestamp;
  }

  setPeakTimeAndDate() {
    let hour = (this.peak.peak_date.split('T')[1]).split(':')[0];
    let hourampmObj = this.calcAMPM(hour);
    this.peak.hour = hourampmObj.hour;
    this.peak.ampm = hourampmObj.ampm;

    // minute
    let minute = this.peak.peak_date.split('T')[1].split(':')[1];
    this.peak.minute = String(minute).padStart(2, '0');
    let timestamp = this.peak.peak_date.split("T")[0];
    timestamp = timestamp.split("-");
    let day = timestamp[0];
    let month = timestamp[1];
    let year = timestamp[2];
    if(this.editOrCreate === "Edit"){
      let utcPreview = new Date(Date.UTC(Number(day), Number(month) - 1, Number(year), Number(this.peak.hour), Number(minute)));
      this.peak.utc_preview = new Date(utcPreview).toUTCString();
    }
  }

  setTimeZone(timezone) {
    this.previewUTC();
  }

  changeTime() {
    let newValue = this.peak.ampm === "PM" ? "AM" : "PM";
    this.peak.ampm = newValue;
    this.previewUTC();
  }

  previewUTC() {
    if(this.form.controls.minute.valid && this.form.controls.hour.valid){
      let ampmValue = this.peak.ampm;
      let hourValue = this.form.controls["hour"].value;
      let minuteValue = this.form.controls["minute"].value;
      let peakDateValue = this.form.controls["peak_date"].value;

      let hour = ampmValue === "PM" ? (Number(hourValue) + 12) : hourValue;
      if(String(hour) === '12' && ampmValue === 'AM'){
        hour = '00';
      }else if (String(hour) === '24' && ampmValue === 'PM'){
        hour = '12';
      }else{
        hour = String(hour).padStart(2, '0');
      }
      let minute = String(minuteValue).padStart(2, '0');
      let initDate;
      try{
        initDate = peakDateValue.split('T')[0];
      }
      catch{
        // If date changed using Datepicker, format will need to be changed
        initDate = DateTime.fromJSDate(peakDateValue).toString();
        initDate = initDate.split('T')[0];
      }
      let date = initDate + "T" + hour + ":" + minute + ":00";
      // Convert to UTC
      let utcDate;
      utcDate = this.timezonesService.convertTimezone(this.form.controls["time_zone"].value, date, minute);
      let utchour = (utcDate.split('T')[1]).split(':')[0].padStart(2, '0');
      this.form.controls["peak_date"].setValue(date);
      this.form.controls["minute"].setValue(minute);
      let timestamp = utcDate.split("T")[0];
      timestamp = timestamp.split("-");
      let day = timestamp[0]
      let month = timestamp[1]
      let year = timestamp[2]
      // UTC Preview
      let utcPreview = new Date(Date.UTC(Number(day), Number(month) - 1, Number(year), Number(utchour), Number(minute)));
      this.peak.utc_preview = new Date(utcPreview).toUTCString();
    }
  }

  determineDFPresent(f) {
    for (var x = 0; x < f.length; x++) {
        if (f[x].filetype_id == 2) {
            return true;
        }
    }
    return false;
  };

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
        }
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

  hideAllDFDetails() {
    let self = this;
    this.sensors.forEach(function(sensor, i){
      sensor.files.forEach(function(file, j){
        self.sensors[i].files[j].showDFDetail = false;
      })
    })
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
          file.showDFDetail = false;
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
      let timezone = this.timezonesService.matchTimezone(results.time_zone)
      this.peak.is_peak_discharge_estimated = results.is_peak_discharge_estimated;
      this.peak.is_peak_estimated = results.is_peak_estimated;
      this.peak.is_peak_stage_estimated = results.is_peak_stage_estimated;
      this.peak.is_peak_time_estimated = results.is_peak_time_estimated;
      this.peak.member_id = results.member_id;
      this.peak.time_zone = timezone;
      this.peak.calc_notes = results.calc_notes;
      this.peak.peak_stage = results.peak_stage;
      this.peak.vdatum_id = results.vdatum_id;
      this.peak.is_hag_estimated = results.is_hag_estimated;
      this.peak.height_above_gnd = results.height_above_gnd;
      this.peak.peak_discharge = results.peak_discharge;
      this.peak.aep = results.aep;
      this.peak.aep_lowci = results.aep_lowci;
      this.peak.aep_upperci = results.aep_upperci;
      this.peak.aep_range = results.aep_range;
      
      this.setMembers();
      // Set form values
      this.form.controls.is_peak_discharge_estimated.setValue(this.peak.is_peak_discharge_estimated === 1 ? true : false);
      this.form.controls.is_peak_estimated.setValue(this.peak.is_peak_estimated === 1 ? true : false);
      this.form.controls.is_peak_stage_estimated.setValue(this.peak.is_peak_stage_estimated === 1 ? true : false);
      this.form.controls.is_peak_time_estimated.setValue(this.peak.is_peak_time_estimated === 1 ? true : false);
      this.form.controls.member_id.setValue(this.peak.member_id !== undefined && this.peak.member_id !== "" ? this.peak.member_id : null);
      this.form.controls.time_zone.setValue(this.peak.time_zone !== undefined && this.peak.time_zone !== "" ? this.peak.time_zone : null);
      this.form.controls.calc_notes.setValue(this.peak.calc_notes !== undefined && this.peak.calc_notes !== "" ? this.peak.calc_notes : null);
      this.form.controls.peak_stage.setValue(this.peak.peak_stage !== undefined && this.peak.peak_stage !== "" ? this.peak.peak_stage : null);
      this.form.controls.vdatum_id.setValue(this.peak.vdatum_id !== undefined && this.peak.vdatum_id !== "" ? this.peak.vdatum_id : null);
      this.form.controls.is_hag_estimated.setValue(this.peak.is_hag_estimated === 1 ? true : false);
      this.form.controls.height_above_gnd.setValue(this.peak.height_above_gnd !== undefined && this.peak.height_above_gnd !== "" ? this.peak.height_above_gnd : null);
      this.form.controls.peak_discharge.setValue(this.peak.peak_discharge !== undefined && this.peak.peak_discharge !== "" ? this.peak.peak_discharge : null);
      this.form.controls.aep.setValue(this.peak.aep !== undefined && this.peak.aep !== "" ? this.peak.aep : null);
      this.form.controls.aep_lowci.setValue(this.peak.aep_lowci !== undefined && this.peak.aep_lowci !== "" ? this.peak.aep_lowci : null);
      this.form.controls.aep_upperci.setValue(this.peak.aep_upperci !== undefined && this.peak.aep_upperci !== "" ? this.peak.aep_upperci : null);
      this.form.controls.aep_range.setValue(this.peak.aep_range !== undefined && this.peak.aep_range !== "" ? this.peak.aep_range : null);

      if(timezone !== 'UTC'){
        this.previewUTC();
      }
    })
  }

  getPeakDataFiles() {
    this.peakEditService.getPeakDataFiles(this.peak.peak_summary_id).subscribe(results => {
      this.peakDFs = results;
      this.getSelectedDataFiles();
    })
  }

  setMembers() {
    this.siteService
    .getMemberName(this.peak.member_id)
    .subscribe((results) => {
      if(results.length > 0 || results.length === undefined){
        this.creator =  results.fname + " " + results.lname;
      }
    })
  }

  // Validate minutes
  validMin() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = control.value >= 60 || control.value < 0;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  // Validate 
  validHour() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = control.value > 12 || control.value < 0;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  initForm() {
    this.form = new FormGroup({
      is_peak_discharge_estimated: new FormControl(this.peak.is_peak_discharge_estimated !== undefined && this.peak.is_peak_discharge_estimated !== "" ? this.peak.is_peak_discharge_estimated : null),
      peak_summary_id: new FormControl(this.peak.peak_summary_id !== undefined && this.peak.peak_summary_id !== "" ? this.peak.peak_summary_id : null),
      peak_date: new FormControl(this.peak.peak_date !== undefined && this.peak.peak_date !== "" ? this.peak.peak_date : null, Validators.required),
      hour: new FormControl(this.peak.hour !== undefined && this.peak.hour !== "" ? this.peak.hour : null, [this.validHour()]),
      minute: new FormControl(this.peak.minute !== undefined && this.peak.minute !== "" ? this.peak.minute : null, [this.validMin()]),
      is_peak_time_estimated: new FormControl(this.peak.is_peak_time_estimated !== undefined && this.peak.is_peak_time_estimated !== "" ? this.peak.is_peak_time_estimated : null),
      is_peak_stage_estimated: new FormControl(this.peak.is_peak_stage_estimated !== undefined && this.peak.is_peak_stage_estimated !== "" ? this.peak.is_peak_stage_estimated : null),
      is_peak_estimated: new FormControl(this.peak.is_peak_estimated !== undefined && this.peak.is_peak_estimated !== "" ? this.peak.is_peak_estimated : null),
      peak_discharge: new FormControl(this.peak.peak_discharge !== undefined && this.peak.peak_discharge !== "" ? this.peak.peak_discharge : null, [this.isNum()]),
      time_zone: new FormControl(this.peak.time_zone !== undefined && this.peak.time_zone !== "" ? this.peak.time_zone : null, Validators.required),
      peak_stage: new FormControl(this.peak.peak_stage !== undefined && this.peak.peak_stage !== "" ? this.peak.peak_stage : null, [this.isNum()]),
      height_above_gnd: new FormControl(this.peak.height_above_gnd !== undefined && this.peak.height_above_gnd !== "" ? this.peak.height_above_gnd : null, [this.isNum()]),
      is_hag_estimated: new FormControl(this.peak.is_hag_estimated !== undefined && this.peak.is_hag_estimated !== "" ? this.peak.is_hag_estimated : null),
      aep: new FormControl(this.peak.aep !== undefined && this.peak.aep !== "" ? this.peak.aep : null, [this.isNum()]),
      aep_lowci: new FormControl(this.peak.aep_lowci !== undefined && this.peak.aep_lowci !== "" ? this.peak.aep_lowci : null, [this.isNum()]),
      aep_upperci: new FormControl(this.peak.aep_upperci !== undefined && this.peak.aep_upperci !== "" ? this.peak.aep_upperci : null, [this.isNum()]),
      aep_range: new FormControl(this.peak.aep_range !== undefined && this.peak.aep_range !== "" ? this.peak.aep_range : null, [this.isNum()]),
      elev_ft: new FormControl(this.peak.elev_ft !== undefined && this.peak.elev_ft !== "" ? this.peak.elev_ft : null),
      vdatum_id: new FormControl(this.peak.vdatum_id !== undefined && this.peak.vdatum_id !== "" ? this.peak.vdatum_id : null),
      site_id: new FormControl(this.data.site_id !== undefined && this.data.site_id !== "" ? this.data.site_id : null),
      member_id: new FormControl(this.peak.member_id !== undefined && this.peak.member_id !== "" ? this.peak.member_id : null),
      calc_notes: new FormControl(this.peak.calc_notes !== undefined && this.peak.calc_notes !== "" ? this.peak.calc_notes : null),
    })
  }

  checkNaN = function(x){
    return isNaN(x);
  }

  isNum() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value);
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  showHWMDetails(i) {
    let self = this;
    this.hideAllSensorDetails();
    this.hideAllDFDetails();
    this.hwms.forEach(function(hwm, j){
      if(hwm.hwm_id !== self.hwms[i].hwm_id){
        // Close all other hwms
        self.hwms[j].showHWMDetail = false;
      }else{
        // Open/close selected hwm
        self.hwms[i].showHWMDetail = !self.hwms[i].showHWMDetail;
      }
    })
  }

  showSensorDetails(i) {
    let self = this;
    this.hideAllHWMDetails();
    this.hideAllDFDetails();
    this.sensors[i].showSensorDetail = !this.sensors[i].showSensorDetail;
    this.sensors.forEach(function(sensor, j){
      if(j !== i){
        self.sensors[j].showSensorDetail = false;
      }
    })
  }

  closeDetail() {
    this.hideAllSensorDetails();
    this.hideAllHWMDetails();
    this.hideAllDFDetails();
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

  showDataFileDetails(file) {
    let self = this;
    this.siteService.getDataFile(file.data_file_id).subscribe((results) => {
      this.df = results;
      this.df.filePath = file.path;
      this.df.fileID = file.file_id;
      this.df.fileDesc = file.description;
      this.df.nwisFile = file.is_nwis == 1 ? true : false;
      this.df.fileURL = file.name;
      // Format dates and times
      let good_start = self.setTimeAndDate(this.df.good_start);
      this.df.format_good_start = good_start;
      let good_end = self.setTimeAndDate(this.df.good_end);
      this.df.format_good_end = good_end;
      let collect_date = self.setTimeAndDate(this.df.collect_date);
      this.df.format_collect_date = collect_date;
      this.hideAllSensorDetails();
      this.hideAllHWMDetails();
      this.siteService
      .getMemberName(results.processor_id)
      .subscribe((response) => {
        if(response.length > 0 || response.length === undefined){
          this.df.processedBy =  response.fname + " " + response.lname;
        }
      })
      // Hide all other DF details
      this.sensors.forEach(function(sensor, i){
        sensor.files.forEach(function(sensorFile, j) {
          if(sensorFile.data_file_id !== file.data_file_id){
            self.sensors[i].files[j].showDFDetail = false;
          }
        })
      })
      file.showDFDetail = !file.showDFDetail;
    });
  }

  addDataFile(file) {
    this.siteService.getDataFile(file.data_file_id).subscribe((results) => {
      if (file.selected === true) {
        // Only values not already selected initially are added
        if(results.peak_summary_id === undefined || results.peak_summary_id !== this.peak.peak_summary_id){
          this.selectedDFs.push(results);
        }
        // Check if has been re-added and remove from remove list
        let index = this.removedDFs.map(function (df) { return df.data_file_id; }).indexOf(file.data_file_id)
        if(index !== -1){
          this.removedDFs.splice(index);
        }
      }else {
          if (results.peak_summary_id !== undefined) {
            if(results.peak_summary_id === this.peak.peak_summary_id){
              //edit.. need to store removed ones for PUT
              this.removedDFs.push(results);
            }
          }
          if (this.selectedDFs.length > 0) {
              let index = this.selectedDFs.map(function (df) { return df.data_file_id; }).indexOf(file.data_file_id);
              this.selectedDFs.splice(index, 1);
          }
      }
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

  formatHWM(h) {
      let fhwm = {
        approval_id: h.approval_id,
        hwm_label: h.hwm_label,
        bank: h.bank,
        elev_ft: h.elev_ft,
        event_id: h.event_id,
        flag_date: h.flag_date,
        flag_member_id: h.flag_member_id,
        hcollect_method_id: h.hcollect_method_id,
        hdatum_id: h.hdatum_id,
        height_above_gnd: h.height_above_gnd,
        hwm_environment: h.hwm_environment,
        hwm_id: h.hwm_id,
        hwm_locationdescription: h.hwm_locationdescription,
        hwm_notes: h.hwm_notes,
        hwm_uncertainty: h.hwm_uncertainty,
        uncertainty: h.uncertainty,
        hwm_quality_id: h.hwm_quality_id,
        hwm_type_id: h.hwm_type_id,
        latitude_dd: h.latitude_dd,
        longitude_dd: h.longitude_dd,
        marker_id: h.marker_id,
        peak_summary_id: h.peak_summary_id,
        site_id: h.site_id,
        stillwater: h.stillwater = "No" ? 0 : 1,
        survey_date: h.survey_date,
        survey_member_id: h.survey_member_id,
        vcollect_method_id: h.vcollect_method_id,
        vdatum_id: h.vdatum_id,
        waterbody: h.waterbody,
      };
      return fhwm;
  }

  //add or remove a hwm from the list of chosen hwms for determining this peak
  addHWM(hwm) {
    let formattedHWM = this.formatHWM(hwm);
    console.log(hwm)
    if (hwm.selected) {
      console.log(hwm.selected)
      // Only values not already selected initially are added
      if(hwm.peak_summary_id === undefined || hwm.peak_summary_id === null){
        this.selectedHWMs.push(formattedHWM);
        console.log(this.selectedHWMs)
      }
      // Check if has been re-added and remove from remove list
      let index = this.removedHWMs.map(function (hwm) { return hwm.hwm_id; }).indexOf(hwm.hwm_id)
      if(index !== -1){
        this.removedHWMs.splice(index);
      }
    } else {
        // Need to store removed ones for PUT
        if (hwm.peak_summary_id !== undefined) {
            this.removedHWMs.push(formattedHWM);
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
      // Confirm returns true
      if(result){
        this.peak.peak_date = new Date(hwm.flag_date);
        this.peak.peak_stage = hwm.elev_ft;
        this.peak.vdatum_id = hwm.vdatum_id;
        this.peak.height_above_gnd = hwm.height_above_gnd;
        let index = this.hwms.indexOf(hwm);
        this.hwms[index].selected = true;
      }
    })
  }

  primaryDataFile(file) {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: "Set as Primary",
        titleIcon: "",
        message: "Are you sure you want to set this as the Primary Data file?",
        confirmButtonText: "OK",
        showCancelButton: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      // Confirm returns true
      if(result){
        let sens = this.sensors.filter(function (s) { return s.instrument_id == file.instrument_id; })[0];
        let sIndex = this.sensors.indexOf(sens);
        let fIndex = sens.files.indexOf(file);
        this.sensors[sIndex].files[fIndex].selected = true;
      }
    })
  }

  submit() {
    this.form.markAllAsTouched();
    console.log(this.form)
    if(this.editOrCreate === "Create"){
      // First determine that they did chooose a hwm or data file for interpretation
      let isHwmChecked = false; 
      let isDFChecked = false;
      this.hwms.forEach((hwm) => {
          if (hwm.selected) isHwmChecked = true;
      });
      this.sensors.forEach((sensor) => {
        sensor.files.forEach((file) => {
          if (file.selected) {
              isDFChecked = true;
          }
        });
      });
      if (isHwmChecked || isDFChecked) {
        this.checkValid();
      }else{
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Error",
            titleIcon: "close",
            message: "You must choose at least one HWM or Data File to use for interpretation for this Peak Summary.",
            confirmButtonText: "OK",
            showCancelButton: false,
          },
        });
      }
    }else{
      this.checkValid();
    }
  }

  // Check if form fields are valid before submitting
  checkValid() {
    if(this.form.valid){
      this.loading = true;

      this.sendRequests();
    }else{
      this.loading = false;
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "",
          titleIcon: "close",
          message: "Some required Peak fields are missing or incorrect.  Please fix these fields before submitting.",
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
    }
  }

  sendRequests() {
    let self = this;
    let promises = [];
    // Copy form value object and delete extra fields
    let peakSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    
    peakSubmission.is_peak_discharge_estimated = peakSubmission.is_peak_discharge_estimated ? 1 : 0;
    peakSubmission.is_peak_estimated = peakSubmission.is_peak_estimated ? 1 : 0;
    peakSubmission.is_peak_stage_estimated = peakSubmission.is_peak_stage_estimated ? 1 : 0;
    peakSubmission.is_peak_time_estimated = peakSubmission.is_peak_time_estimated ? 1 : 0;
    peakSubmission.is_hag_estimated = peakSubmission.is_hag_estimated ? 1 : 0;
    
    // convert to UTC
    peakSubmission.peak_date = this.peak.utc_preview;
    peakSubmission.time_zone = "UTC";
    delete peakSubmission.ampm; delete peakSubmission.hour; delete peakSubmission.minute; delete peakSubmission.utc_preview;
    console.log(this.removedDFs)
    console.log(this.removedHWMs)
    console.log(this.selectedDFs)
    console.log(this.selectedHWMs)
    console.log(peakSubmission)
    // Edit peak
    if(this.editOrCreate === "Edit"){

      const updatePeak = new Promise<string>((resolve, reject) => this.peakEditService.putPeak(peakSubmission.peak_summary_id, peakSubmission).subscribe(results => {
        if(results.length !== 0){
          this.returnData.peak = results;
          
          // Remove DFs
          if(this.removedDFs.length > 0) {
            this.removedDFs.forEach(function(df) {
              df.peak_summary_id = null;
              self.peakEditService.updateDF(df.data_file_id, df).subscribe(results => {
                console.log(results);
              });
            });
          }
          // Remove HWMs
          if(this.removedHWMs.length > 0) {
            this.removedHWMs.forEach(function(hwm) {
              hwm.peak_summary_id = null;
              const removeHWM = new Promise<string>((resolve, reject) => self.peakEditService.updateHWM(hwm.hwm_id, hwm).subscribe(results => {
                console.log(results);
                self.returnData.hwmsToRemove.push(results.hwm_id)
                resolve("Success");
              }));
              promises.push(removeHWM);
            });
          }
          // Add DFs
          if(this.selectedDFs.length > 0) {
            this.selectedDFs.forEach(function(df) {
              df.peak_summary_id = results.peak_summary_id;
              self.peakEditService.updateDF(df.data_file_id, df).subscribe(results => {
                console.log(results);
              });
            });
          }
          // Add HWMs
          if(this.selectedHWMs.length > 0) {
            this.selectedHWMs.forEach(function(hwm) {
              hwm.peak_summary_id = results.peak_summary_id;
              const addHWM = new Promise<string>((resolve, reject) => self.peakEditService.updateHWM(hwm.hwm_id, hwm).subscribe(results => {
                console.log(results);
                self.returnData.hwmsToAdd.push(results.hwm_id);
                resolve("Success");
              }));
              promises.push(addHWM);
            });
          }
          Promise.all(promises).then(() => {
            resolve("Peak Success");
          })
        }else{
          // Error
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error updating Peak",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
          reject(new Error("Error updating Peak."));
        }
      }));

      updatePeak.then(() => {
        this.loading = false;
        this.dialogRef.close(this.returnData);
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully updated Peak",
            titleIcon: "check",
            message: null,
            confirmButtonText: "OK",
            showCancelButton: false,
          },
        });
      }).catch(function(error) {
        console.log(error.message);
        this.loading = false;
      });
    }else if(this.editOrCreate === "Create"){
      // Create new peak
      const createPeak = new Promise<string>((resolve, reject) => this.peakEditService.postPeak(peakSubmission).subscribe(results => {
        if(results.length !== 0){
          this.returnData.peak = results;
          
          // Add DFs
          if(this.selectedDFs.length > 0) {
            this.selectedDFs.forEach(function(df) {
              df.peak_summary_id = results.peak_summary_id;
              self.peakEditService.updateDF(df.data_file_id, df).subscribe(results => {
                console.log(results);
              });
            });
          }
          // Add HWMs
          if(this.selectedHWMs.length > 0) {
            this.selectedHWMs.forEach(function(hwm) {
              hwm.peak_summary_id = results.peak_summary_id;
              const addHWM = new Promise<string>((resolve, reject) => self.peakEditService.updateHWM(hwm.hwm_id, hwm).subscribe(results => {
                console.log(results);
                self.returnData.hwmsToAdd.push(results.hwm_id);
                resolve("Success");
              }));
              promises.push(addHWM);
            });
          }
          Promise.all(promises).then(() => {
            resolve("Peak Success");
          })
        }else{
          // Error
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error creating Peak",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
          reject(new Error("Error creating Peak."));
        }
      }));

      createPeak.then(() => {
        this.loading = false;
        this.dialogRef.close(this.returnData);
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully created Peak",
            titleIcon: "check",
            message: null,
            confirmButtonText: "OK",
            showCancelButton: false,
          },
        });
      }).catch(function(error) {
        console.log(error.message);
        this.loading = false;
      });
    }
  }

}
