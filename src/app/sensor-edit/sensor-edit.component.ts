import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorEditService } from '@app/services/sensor-edit.service';
import { SiteService } from '@app/services/site.service';
import { TimezonesService } from '@app/services/timezones.service';
import { DateTime } from "luxon";

@Component({
  selector: 'app-sensor-edit',
  templateUrl: './sensor-edit.component.html',
  styleUrls: ['./sensor-edit.component.scss']
})
export class SensorEditComponent implements OnInit {

  public sensor;
  public form;
  public sensorTypes;
  public sensorBrands;
  public housingTypes;
  public deploymentTypes;
  public collectConds;
  public initSensorFiles = [];
  public initNWISFiles = [];
  public vDatumList;
  public interval_unit = "sec";
  public timeZones = ['UTC', 'PST', 'MST', 'CST', 'EST', 'PDT', 'MDT', 'CDT', 'EDT'];
  public statusTypes = [{status: "Lost", status_type_id: 3}, {status: "Retrieved", status_type_id: 2}];
  public allStatusTypes = [{status: "Lost", status_type_id: 3}, {status: "Retrieved", status_type_id: 2}, {status: "Deployed", status_type_id: 1}];
  public opsPresent = false;
  public deployedTapedowns = [];
  public retrievedTapedowns = [];
  public lostTapedowns = [];
  public initDeployedRefMarks = [];
  public initRetrievedRefMarks = [];
  public initLostRefMarks = [];

  constructor(
    private dialogRef: MatDialogRef<SensorEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sensorEditService: SensorEditService,
    public siteService: SiteService,
    public timezonesService: TimezonesService,
  ) { }

  deployedExpanded = false;
  retrievedExpanded = false;
  lostExpanded = false;
  filesExpanded = false;
  nwisExpanded = false;
  loading = false;

  displayedFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  displayedNWISFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  displayedTapedownColumns: string[] = [
    'ReferenceMark',
    'Elevation',
    'OffsetCorrection',
    'WaterSurface',
    'GroundSurface',
  ];

  ngOnInit(): void {
    // Copy of initial sensor
    this.sensor = JSON.parse(JSON.stringify(this.data.sensor));
    if(this.sensor.statusType === "Deployed"){
      this.deployedExpanded = true;
    }else if (this.sensor.statusType === "Retrieved"){
      this.retrievedExpanded = true;
    }else if (this.sensor.statusType === "Lost"){
      this.lostExpanded = true;
    }
    console.log(this.sensor);
    if(this.data.siteRefMarks.length > 0){
      this.opsPresent = true;
    }

    this.createTapedownTable();
    this.getSensorTypes();
    this.getSensorBrands();
    this.getHousingTypes();
    this.getDeploymentTypes();
    this.getVDatums();
    this.setTimeAndDate();
    this.collectConditionLookup();
    this.getInitFiles();
    this.setMembers();
    this.initForm();
  }

  getSensorTypes() {
    this.sensorEditService.getSensorTypeLookup()
      .subscribe((results) => {
        this.sensorTypes = results;
      })
  }

  getSensorBrands() {
    this.sensorEditService.getSensorBrandLookup()
    .subscribe((results) => {
      this.sensorBrands = results;
    })
  }

  getHousingTypes() {
    this.siteService.getAllHousingTypes()
      .subscribe((results) => {
        this.housingTypes = results;
      })
  }

  getDeploymentTypes() {
    this.siteService.getDeploymentTypes()
      .subscribe((results) => {
        this.deploymentTypes = results;
      })
  }

  getVDatums() {
    let self = this;
    this.siteService.getVDatumLookup()
      .subscribe((results) => {
        this.vDatumList = results;
        if(this.data.siteRefMarks.length > 0){
          this.vDatumList.forEach(function(datum){
            self.data.siteRefMarks.forEach(function(mark, i){
              if(datum.datum_id === mark.vdatum_id){
                self.data.siteRefMarks[i].vdatum = datum.datum_name;
              }
            })
          })
        }
      })
  }

  setTimeAndDate() {
    let self = this;
    this.sensor.instrument_status.forEach(function(instrument, i){
      // hour
      let hour = (instrument.time_stamp.split('T')[1]).split(':')[0];
      if(hour > 12){
        self.sensor.instrument_status[i].hour = String(hour - 12).padStart(2, '0');
        self.sensor.instrument_status[i].ampm = "PM";
      }else{
        instrument.time_stamp.hour = hour;
        self.sensor.instrument_status[i].ampm = "AM";
      }
      // minute
      let minute = instrument.time_stamp.split('T')[1].split(':')[1];
      self.sensor.instrument_status[i].minute = String(minute).padStart(2, '0');
      instrument.utc_preview = instrument.time_stamp;
    })
  }

  collectConditionLookup() {
    this.sensorEditService.getCollectConditions()
    .subscribe((results) => {
      this.collectConds = results;
    })
  }

  getInitFiles() {
    let self = this;
    this.data.files.forEach(function(file){
      if(file.instrument_id === self.sensor.instrument_id){
        if(file.is_nwis !== undefined && file.is_nwis === 1){
          self.initNWISFiles.push(file);
        }else{
          self.initSensorFiles.push(file);
        }
      }
    })
  }

  setMembers() {
    let self = this;

    this.sensor.instrument_status.forEach(function(instrument, i){
      self.siteService
      .getMemberName(instrument.member_id)
      .subscribe((results) => {
        if(results.length > 0 || results.length === undefined){
          self.sensor.instrument_status[i].member_name =  results.fname + " " + results.lname;
        }
      })
    })
  }

  createTapedownTable(){
    let self = this;

    function getTapedowns(tapedownArray, instrument, controlName){
        self.siteService
        .getOPMeasurements(instrument.instrument_status_id)
        .subscribe((results) => {
          if(results.length > 0){
            if (tapedownArray[0] !== undefined){
              tapedownArray[0].ground_surface = results[0].ground_surface;
            }else{
              tapedownArray.push({ground_surface: results[0].ground_surface});
            }
            tapedownArray[0].water_surface = results[0].water_surface;
            tapedownArray[0].offset_correction = results[0].offset_correction;
            // get reference datum info using objective_point_id
            self.siteService
            .getOPInfo(results[0].objective_point_id)
            .subscribe((objectivePoints) => {
              tapedownArray[0].rmName = objectivePoints.name;
              if(controlName === "deployedTapedowns"){
                tapedownArray.forEach(function(tapedown){
                  self.initDeployedRefMarks.push(tapedown.rmName);
                })
                self.form.controls.deployedRefMarks.setValue(self.initDeployedRefMarks);
              }else if(controlName === "retrievedTapedowns"){
                tapedownArray.forEach(function(tapedown){
                  self.initRetrievedRefMarks.push(tapedown.rmName);
                })
                self.form.controls.retrievedRefMarks.setValue(self.initRetrievedRefMarks);
              }else if(controlName === "lostTapedowns"){
                tapedownArray.forEach(function(tapedown){
                  self.initLostRefMarks.push(tapedown.rmName);
                })
                self.form.controls.lostRefMarks.setValue(self.initLostRefMarks);
              }
              if(objectivePoints.elev_ft !== undefined){
                tapedownArray[0].elevation = objectivePoints.elev_ft;
              }
              if(instrument.vdatum !== undefined && instrument.vdatum !== ''){
                tapedownArray[0].vdatum = instrument.vdatum;
              }     
              self.form.controls[controlName] = new FormArray(tapedownArray.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
            })
          }
        });
    }

    this.sensor.instrument_status.forEach(function(instrument){
      if(instrument.status === 'Deployed'){
        getTapedowns(self.deployedTapedowns, instrument, "deployedTapedowns");
      }
      else if (instrument.status === 'Retrieved'){
        getTapedowns(self.retrievedTapedowns, instrument, "retrievedTapedowns");
      }
      else if (instrument.status === 'Lost'){
        getTapedowns(self.lostTapedowns, instrument, "lostTapedowns");
      }
    })
  }

  initForm() {
    this.form = new FormGroup({
      sensor_type_id: new FormControl(this.sensor.sensor_type_id !== undefined && this.sensor.sensor_type_id !== "" ? this.sensor.sensor_type_id : null, Validators.required),
      sensor_brand_id: new FormControl(this.sensor.sensor_brand_id !== undefined && this.sensor.sensor_brand_id !== "" ? this.sensor.sensor_brand_id : null, Validators.required),
      serial_number: new FormControl(this.sensor.serial_number !== undefined && this.sensor.serial_number !== "" ? this.sensor.serial_number : null, Validators.required),
      housing_serial_number: new FormControl(this.sensor.housing_serial_number !== undefined && this.sensor.housing_serial_number !== "" ? this.sensor.housing_serial_number : null),
      housing_type_id: new FormControl(this.sensor.housing_type_id !== undefined && this.sensor.housing_type_id !== "" ? this.sensor.housing_type_id : null),
      vented: new FormControl(this.sensor.vented !== undefined && this.sensor.vented !== "" ? this.sensor.vented : null),
      deployment_type_id: new FormControl(this.sensor.deployment_type_id !== undefined && this.sensor.deployment_type_id !== "" ? this.sensor.deployment_type_id : null, Validators.required),
      location_description: new FormControl(this.sensor.location_description !== undefined && this.sensor.location_description !== "" ? this.sensor.location_description : null),
      interval: new FormControl(this.sensor.interval !== undefined && this.sensor.interval !== "" ? this.sensor.interval : null),
      instrument_status: new FormArray(this.sensor.instrument_status.map((instrument) => new FormGroup(this.createInstrumentArray(instrument)))),
      deployedTapedowns: new FormArray(this.deployedTapedowns.map((tapedown) => new FormGroup(this.createTapedownArray(tapedown)))),
      retrievedTapedowns: new FormArray(this.retrievedTapedowns.map((tapedown) => new FormGroup(this.createTapedownArray(tapedown)))),
      lostTapedowns: new FormArray(this.lostTapedowns.map((tapedown) => new FormGroup(this.createTapedownArray(tapedown)))),
      site_id: new FormControl(this.sensor.site_id !== undefined && this.sensor.site_id !== "" ? this.sensor.site_id : null),
      inst_collection_id: new FormControl(this.sensor.inst_collection_id !== undefined && this.sensor.inst_collection_id !== "" ? this.sensor.inst_collection_id : null),
      deployedRefMarks: new FormControl(),
      retrievedRefMarks: new FormControl(),
      lostRefMarks: new FormControl(),
    })

    this.form.controls.interval.setValidators([this.isNum()]);
  }

  checkNaN = function(x){
    return isNaN(x);
  }

  // Validate interval
  isNum() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value);
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  createInstrumentArray(instrument) {
    return {
      time_stamp: new FormControl(instrument.time_stamp ? instrument.time_stamp: null),
      time_zone: new FormControl(instrument.time_zone ? instrument.time_zone : null),
      notes: new FormControl(instrument.notes ? instrument.notes: null),
      member_id: new FormControl(instrument.member_id ? instrument.member_id : null),
      vdatum_id: new FormControl(instrument.vdatum_id ? instrument.vdatum_id : null),
      sensor_elevation: new FormControl(instrument.sensor_elevation ? instrument.sensor_elevation : null),
      ws_elevation: new FormControl(instrument.ws_elevation ? instrument.ws_elevation : null),
      gs_elevation: new FormControl(instrument.gs_elevation ? instrument.gs_elevation : null),
      status_type_id: new FormControl(instrument.status_type_id ? instrument.status_type_id : null),
      hour: new FormControl(instrument.hour ? instrument.hour : null),
      minute: new FormControl(instrument.minute ? instrument.minute : null),
      ampm: new FormControl(instrument.ampm ? instrument.ampm : null),
    } as FormArray["value"];
  }

  createTapedownArray(tapedown) {
    return {
      rmName: new FormControl({value: tapedown.rmName ? tapedown.rmName: null, disabled: true}),
      vdatum: new FormControl({value: tapedown.vdatum ? tapedown.vdatum: null, disabled: true}),
      elevation: new FormControl({value: tapedown.elevation ? tapedown.elevation : null, disabled: true}),
      offset_correction: new FormControl(tapedown.offset_correction ? tapedown.offset_correction: null),
      water_surface: new FormControl(tapedown.water_surface ? tapedown.water_surface : null),
      ground_surface: new FormControl(tapedown.ground_surface ? tapedown.ground_surface : null),
    } as FormArray["value"];
  }

  changeTime(instrument) {
    let self = this;
    let newValue = instrument.ampm === "PM" ? "AM" : "PM";
    self.form.controls["instrument_status"].controls.forEach(function(instrument_status, i){
      if(instrument_status.controls.status_type_id.value === instrument.status_type_id){
          self.form.controls["instrument_status"].controls[i].controls["ampm"].setValue(newValue);
      }
    });
    instrument.ampm = newValue;
    this.previewUTC(instrument);
  }

  changeTableValue(value, status){
    let newObject = {
      rmName: null,
      elevation: null,
      offset_correction: null,
      water_surface: null,
      ground_surface: null,
      vdatum: null,
    }
    let self = this;

    let addTapedown = function(statusArray, controlName, status) {
      // If no rms, only 1 value exists
      if(statusArray.length === 0){
        newObject.rmName = value[0];
        self.data.siteRefMarks.forEach(function(mark){
          if(value[0] === mark.name){
            newObject.elevation = mark.elev_ft;
            newObject.vdatum = mark.vdatum;
            self.form.controls["instrument_status"].controls.forEach(function(instrument, i){
              for(let statusType of self.allStatusTypes){
                if(instrument.controls.status_type_id.value === statusType.status_type_id){
                  if(statusType.status === status){
                    self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(mark.vdatum_id);
                  }
                }
              }
            });
            statusArray.push(newObject);
          }
        })
      }else{
        // Add to table
        value.forEach(function(name){
          if(!statusArray.join(',').includes(name)){
            newObject.rmName = name;
            self.data.siteRefMarks.forEach(function(mark){
              if(name === mark.name){
                newObject.elevation = mark.elev_ft;
                newObject.vdatum = mark.vdatum;
                self.form.controls["instrument_status"].controls.forEach(function(instrument, i){
                  for(let statusType of self.allStatusTypes){
                    if(instrument.controls.status_type_id.value === statusType.status_type_id){
                      if(statusType.status === status){
                        self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(mark.vdatum_id);
                      }
                    }
                  }
                });
                statusArray.push(newObject);
              }
            })
          }
        })
      }
      statusArray = [...statusArray];
      self.form.controls[controlName] = new FormArray(statusArray.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
    }

    if(status === "Retrieved"){
      // Add tapedown
      if(value.length > 0){
        addTapedown(this.retrievedTapedowns, "retrievedTapedowns", status);
      }
      // Remove tapedown
      else{
        let okayToDelete = confirm("Are you sure you want to remove this OP Measurement from this sensor?");
        if(okayToDelete){
          // remove
          this.retrievedTapedowns = [];
          this.retrievedTapedowns = [...this.retrievedTapedowns];
          self.form.controls["retrievedTapedowns"] = new FormArray(this.retrievedTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
          self.form.controls["instrument_status"].controls.forEach(function(instrument, i){
            for(let statusType of self.allStatusTypes){
              if(instrument.controls.status_type_id.value === statusType.status_type_id){
                if(statusType.status === "Retrieved"){
                  self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(null);
                  self.form.controls["instrument_status"].controls[i].controls["sensor_elevation"].setValue(null);
                  self.form.controls["instrument_status"].controls[i].controls["ws_elevation"].setValue(null);
                  self.form.controls["instrument_status"].controls[i].controls["gs_elevation"].setValue(null);
                }
              }
            }
          });
        }
      }
    }else if(status === "Deployed"){
        // Add tapedown
        if(value.length > 0){   
          addTapedown(this.deployedTapedowns, "deployedTapedowns", status);
        }
        // Remove tapedown
        else{
          let okayToDelete = confirm("Are you sure you want to remove this OP Measurement from this sensor?");
          if(okayToDelete){
            // remove
            this.deployedTapedowns = [];
            this.deployedTapedowns = [...this.deployedTapedowns];
            self.form.controls["deployedTapedowns"] = new FormArray(this.deployedTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
            self.form.controls["instrument_status"].controls.forEach(function(instrument, i){
              for(let statusType of self.allStatusTypes){
                if(instrument.controls.status_type_id.value === statusType.status_type_id){
                  if(statusType.status === "Deployed"){
                    self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(null);
                    self.form.controls["instrument_status"].controls[i].controls["sensor_elevation"].setValue(null);
                    self.form.controls["instrument_status"].controls[i].controls["ws_elevation"].setValue(null);
                    self.form.controls["instrument_status"].controls[i].controls["gs_elevation"].setValue(null);
                  }
                }
              }
            });
          }
        }
    }else if(status === "Lost"){
      // Add tapedown
      if(value.length > 0){   
        addTapedown(this.lostTapedowns, "lostTapedowns", status);
      }
      // Remove tapedown
      else{
        let okayToDelete = confirm("Are you sure you want to remove this OP Measurement from this sensor?");
        if(okayToDelete){
          // remove
          this.lostTapedowns = [];
          this.lostTapedowns = [...this.lostTapedowns];
          self.form.controls["lostTapedowns"] = new FormArray(this.lostTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
          self.form.controls["instrument_status"].controls.forEach(function(instrument, i){
            for(let statusType of self.allStatusTypes){
              if(instrument.controls.status_type_id.value === statusType.status_type_id){
                if(statusType.status === "Lost"){
                  self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(null);
                  self.form.controls["instrument_status"].controls[i].controls["sensor_elevation"].setValue(null);
                  self.form.controls["instrument_status"].controls[i].controls["ws_elevation"].setValue(null);
                  self.form.controls["instrument_status"].controls[i].controls["gs_elevation"].setValue(null);
                }
              }
            }
          });
        }
      }
    }
  }

  setTimeZone(instrument) {
    // let self = this;
    console.log(instrument)
    this.form.controls["instrument_status"].controls.forEach(function(instrument_status, i){
      if(instrument_status.controls.status_type_id.value === instrument.status_type_id){
        console.log(instrument_status)
          instrument.time_zone = instrument_status.controls.time_zone.value;
      }
    });
    this.previewUTC(instrument);
  }

  previewUTC(instrument) {
    let self = this;
    
    this.form.controls["instrument_status"].controls.forEach(function(instrument_status, i){
      if(instrument_status.controls.status_type_id.value === instrument.status_type_id){
          let hour = instrument_status.value.ampm === "PM" ? (Number(instrument_status.value.hour) + 12) : instrument_status.value.hour;
          hour = String(hour).padStart(2, '0');
          let minute = String(instrument_status.value.minute).padStart(2, '0');
          let date = instrument_status.value.time_stamp.split('T')[0] + "T" + hour + ":" + minute + ":00";
          let utcDate;
          utcDate = self.timezonesService.convertTimezone(instrument.time_zone, date, minute);
          self.form.controls["instrument_status"].controls[i].controls["time_stamp"].setValue(utcDate);
          self.form.controls["instrument_status"].controls[i].controls["hour"].setValue(String(instrument_status.value.hour).padStart(2, '0'));
          self.form.controls["instrument_status"].controls[i].controls["minute"].setValue(minute);
          instrument.hour = String(instrument_status.value.hour).padStart(2, '0');
          instrument.minute = minute;
          instrument.time_stamp = date;
          instrument.utc_preview = utcDate;
          console.log(utcDate)
      }
    });
  }

  ventedChange(event){
    this.form.controls.vented.setValue(event.value);
  }

  intervalUnitChange(event) {
    this.interval_unit = event.value;
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.loading = true;

      // If elevation in meters, convert to ft before submitting
      if(this.interval_unit === "min"){
        this.form.controls.interval.setValue(this.form.controls.interval.value * 60);
      }

      this.sendRequests();
    }else{
      this.loading = false;
      alert("Some required sensor fields are missing or incorrect.  Please fix these fields before submitting.")
    }
  }

  async sendRequests() {
    let self = this;
    let promises = [];

    // Copy form value object and delete extra fields, include disabled form values in submission
    let sensorSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    console.log(sensorSubmission);
    // delete sensorSubmission.latdeg; delete sensorSubmission.latmin; delete sensorSubmission.latsec; delete sensorSubmission.londeg; delete sensorSubmission.lonmin; delete sensorSubmission.lonsec;
    // delete sensorSubmission.op_control_identifier;

  }
}
