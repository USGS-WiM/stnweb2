import { I } from '@angular/cdk/keycodes';
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
  public initDeployedTapedowns = [];
  public initRetrievedTapedowns = [];
  public initLostTapedowns = [];
  public deployedTapedowns = [];
  public retrievedTapedowns = [];
  public lostTapedowns = [];
  public initDeployedRefMarks = [];
  public initRetrievedRefMarks = [];
  public initLostRefMarks = [];
  public returnData;

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
    this.returnData = this.sensor;
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
        // instrument.time_stamp.hour = hour;
        self.sensor.instrument_status[i].hour = String(hour).padStart(2, '0');
        self.sensor.instrument_status[i].ampm = "AM";
      }
      // minute
      let minute = instrument.time_stamp.split('T')[1].split(':')[1];
      self.sensor.instrument_status[i].minute = String(minute).padStart(2, '0');
      let timestamp = instrument.time_stamp.split("T")[0];
      timestamp = timestamp.split("-");
      timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + hour + ":" + self.sensor.instrument_status[i].minute;
      instrument.utc_preview = timestamp.replace(/T/, ' ').replace(/\..+/, '');
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
          console.log(results)
          if(results.length > 0){
            if (tapedownArray[0] !== undefined){
              tapedownArray[0].ground_surface = results[0].ground_surface;
            }else{
              tapedownArray.push({ground_surface: results[0].ground_surface});
            }
            tapedownArray[0].water_surface = results[0].water_surface;
            tapedownArray[0].offset_correction = results[0].offset_correction;
            tapedownArray[0].op_measurements_id = results[0].op_measurements_id;
            // get reference datum info using objective_point_id
            self.siteService
            .getOPInfo(results[0].objective_point_id)
            .subscribe((objectivePoints) => {
              tapedownArray[0].rmName = objectivePoints.name;
              if(objectivePoints.elev_ft !== undefined){
                tapedownArray[0].elevation = objectivePoints.elev_ft;
              }
              if(instrument.vdatum !== undefined && instrument.vdatum !== ''){
                tapedownArray[0].vdatum = instrument.vdatum;
              }     
              if(controlName === "deployedTapedowns"){
                tapedownArray.forEach(function(tapedown){
                  self.initDeployedRefMarks.push(tapedown.rmName);
                })
                self.form.controls.deployedRefMarks.setValue(self.initDeployedRefMarks);
                self.initDeployedTapedowns = tapedownArray;
              }else if(controlName === "retrievedTapedowns"){
                tapedownArray.forEach(function(tapedown){
                  self.initRetrievedRefMarks.push(tapedown.rmName);
                })
                self.form.controls.retrievedRefMarks.setValue(self.initRetrievedRefMarks);
                self.initRetrievedTapedowns = tapedownArray;
              }else if(controlName === "lostTapedowns"){
                tapedownArray.forEach(function(tapedown){
                  self.initLostRefMarks.push(tapedown.rmName);
                })
                self.form.controls.lostRefMarks.setValue(self.initLostRefMarks);
                this.initLostTapedowns
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
      event_id: new FormControl(this.sensor.event_id !== undefined && this.sensor.event_id !== "" ? this.sensor.event_id : null),
      instrument_id: new FormControl(this.sensor.instrument_id !== undefined && this.sensor.instrument_id !== "" ? this.sensor.instrument_id : null),
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
      instrument_id: new FormControl(this.sensor.instrument_id ? this.sensor.instrument_id: null),
      instrument_status_id: new FormControl(instrument.instrument_status_id ? instrument.instrument_status_id: null),
      time_stamp: new FormControl(instrument.time_stamp ? instrument.time_stamp: null),
      time_zone: new FormControl(instrument.time_zone ? instrument.time_zone : null),
      notes: new FormControl(instrument.notes ? instrument.notes: null),
      member_id: new FormControl(instrument.member_id ? instrument.member_id : null),
      vdatum_id: new FormControl(instrument.vdatum_id ? instrument.vdatum_id : null),
      vdatum: new FormControl(instrument.vdatum ? instrument.vdatum : null),
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
      ground_surface: new FormControl(tapedown.ground_surface ? tapedown.ground_surface : null),
      water_surface: new FormControl(tapedown.water_surface ? tapedown.water_surface : null),
      offset_correction: new FormControl(tapedown.offset_correction ? tapedown.offset_correction: null),
      op_measurements_id: new FormControl(tapedown.op_measurements_id ? tapedown.op_measurements_id : null),
      rmName: new FormControl({value: tapedown.rmName ? tapedown.rmName: null, disabled: true}),
      vdatum: new FormControl({value: tapedown.vdatum ? tapedown.vdatum: null, disabled: true}),
      elevation: new FormControl({value: tapedown.elevation ? tapedown.elevation : null, disabled: true}),
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
      ground_surface: null,
      water_surface: null,
      offset_correction: null,
      op_measurements_id: null,
      rmName: null,
      elevation: null,
      vdatum: null,
    }
    let self = this;

    let addTapedown = function(statusArray, controlName, status, initRefMarks, initTapedowns) {
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
            if(initRefMarks.join(',').includes(mark.name)){
              // Use existing op_measurements_id
              for(let tapedown of initTapedowns){
                if(tapedown.rmName === mark.name){
                  newObject.op_measurements_id = tapedown.op_measurements_id;
                }
              }
            }
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
                if(initRefMarks.join(',').includes(mark.name)){
                  // Use existing op_measurements_id
                  for(let tapedown of initTapedowns){
                    if(tapedown.rmName === mark.name){
                      newObject.op_measurements_id = tapedown.op_measurements_id;
                    }
                  }
                }
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
        addTapedown(this.retrievedTapedowns, "retrievedTapedowns", status, this.initRetrievedRefMarks, this.initRetrievedTapedowns);
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
          addTapedown(this.deployedTapedowns, "deployedTapedowns", status, this.initDeployedRefMarks, this.initDeployedTapedowns);
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
        addTapedown(this.lostTapedowns, "lostTapedowns", status, this.initLostRefMarks, this.initLostTapedowns);
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
          // Convert to UTC
          let utcDate;
          utcDate = self.timezonesService.convertTimezone(instrument.time_zone, date, minute);
          let utchour = (utcDate.split('T')[1]).split(':')[0].padStart(2, '0');
          self.form.controls["instrument_status"].controls[i].controls["time_stamp"].setValue(date);
          self.form.controls["instrument_status"].controls[i].controls["hour"].setValue(instrument.hour);
          self.form.controls["instrument_status"].controls[i].controls["minute"].setValue(minute);
          let timestamp = utcDate.split("T")[0];
          timestamp = timestamp.split("-");
          timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + utchour + ":" + minute;
          instrument.utc_preview = timestamp.replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '/');
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

  // Reset canceled form to initial values
  cancelForm(statusType) {
    let self = this;
    console.log(statusType)
    if(statusType === "Deployed") {
      this.form.controls.deployedRefMarks.setValue(this.initDeployedRefMarks);
      this.form.controls.deployedTapedowns = new FormArray(this.initDeployedTapedowns.map((tapedown) => new FormGroup(this.createTapedownArray(tapedown))));
      this.form.controls.event_id.setValue(this.sensor.event_id !== undefined && this.sensor.event_id !== "" ? this.sensor.event_id : null),
      this.form.controls.instrument_id.setValue(this.sensor.instrument_id !== undefined && this.sensor.instrument_id !== "" ? this.sensor.instrument_id : null),
      this.form.controls.sensor_type_id.setValue(this.sensor.sensor_type_id !== undefined && this.sensor.sensor_type_id !== "" ? this.sensor.sensor_type_id : null, Validators.required),
      this.form.controls.sensor_brand_id.setValue(this.sensor.sensor_brand_id !== undefined && this.sensor.sensor_brand_id !== "" ? this.sensor.sensor_brand_id : null, Validators.required),
      this.form.controls.serial_number.setValue(this.sensor.serial_number !== undefined && this.sensor.serial_number !== "" ? this.sensor.serial_number : null, Validators.required),
      this.form.controls.housing_serial_number.setValue(this.sensor.housing_serial_number !== undefined && this.sensor.housing_serial_number !== "" ? this.sensor.housing_serial_number : null),
      this.form.controls.housing_type_id.setValue(this.sensor.housing_type_id !== undefined && this.sensor.housing_type_id !== "" ? this.sensor.housing_type_id : null),
      this.form.controls.vented.setValue(this.sensor.vented !== undefined && this.sensor.vented !== "" ? this.sensor.vented : null),
      this.form.controls.deployment_type_id.setValue(this.sensor.deployment_type_id !== undefined && this.sensor.deployment_type_id !== "" ? this.sensor.deployment_type_id : null, Validators.required),
      this.form.controls.location_description.setValue(this.sensor.location_description !== undefined && this.sensor.location_description !== "" ? this.sensor.location_description : null),
      this.form.controls.interval.setValue(this.sensor.interval !== undefined && this.sensor.interval !== "" ? this.sensor.interval : null),
      this.form.controls.inst_collection_id.setValue(this.sensor.inst_collection_id !== undefined && this.sensor.inst_collection_id !== "" ? this.sensor.inst_collection_id : null),
      this.sensor.instrument_status.forEach(function(instrument, i){
        if(instrument.status === 'Deployed'){
          let initInstrument = self.sensor.instrument_status.filter(function(instrument) {return instrument.status === "Deployed"});
          self.form.controls.instrument_status[i].controls = new FormGroup(self.createInstrumentArray(initInstrument));
        }
      })
      console.log(this.form);
    }else if(statusType === "Retrieved") {
      this.form.controls.deployedRefMarks.setValue(this.initRetrievedRefMarks);
      this.form.controls.retrievedTapedowns = new FormArray(this.initRetrievedTapedowns.map((tapedown) => new FormGroup(this.createTapedownArray(tapedown))));
      this.sensor.instrument_status.forEach(function(instrument, i){
        if(instrument.status === 'Retrieved'){
          let initInstrument = self.sensor.instrument_status.filter(function(instrument) {return instrument.status === "Retrieved"});
          self.form.controls.instrument_status[i].controls = new FormGroup(self.createInstrumentArray(initInstrument));
        }
      })
      console.log(this.form)
    }else if(statusType === "Lost") {
      this.form.controls.lostRefMarks.setValue(this.initLostRefMarks);
      this.form.controls.lostTapedowns = new FormArray(this.initLostTapedowns.map((tapedown) => new FormGroup(this.createTapedownArray(tapedown))));
      this.sensor.instrument_status.forEach(function(instrument, i){
        if(instrument.status === 'Lost'){
          let initInstrument = self.sensor.instrument_status.filter(function(instrument) {return instrument.status === "Lost"});
          self.form.controls.instrument_status[i].controls = new FormGroup(self.createInstrumentArray(initInstrument));
        }
      })
    }
  }

  submit(statusID) {
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.loading = true;

      // If elevation in meters, convert to ft before submitting
      if(this.interval_unit === "min"){
        this.form.controls.interval.setValue(this.form.controls.interval.value * 60);
      }

      this.sendRequests(statusID);
    }else{
      this.loading = false;
      alert("Some required sensor fields are missing or incorrect.  Please fix these fields before submitting.")
    }
  }

  async sendRequests(statusID) {
    let self = this;
    let promises = [];

    // Copy form value object and delete extra fields, include disabled form values in submission
    let sensorSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    let sensorStatusSubmission = JSON.parse(JSON.stringify(this.form.controls.instrument_status.getRawValue()));

    let deployedTapedowns = sensorSubmission.deployedTapedowns;
    let retrievedTapedowns = sensorSubmission.retrievedTapedowns;
    let lostTapedowns = sensorSubmission.lostTapedowns;

    deployedTapedowns.forEach((i) => delete i.elevation);
    retrievedTapedowns.forEach((i) => delete i.elevation);
    lostTapedowns.forEach((i) => delete i.elevation);

    // Put instrument
    delete sensorSubmission.lostRefMarks; delete sensorSubmission.deployedRefMarks; delete sensorSubmission.retrievedRefMarks; delete sensorSubmission.lostTapedowns; delete sensorSubmission.deployedTapedowns; delete sensorSubmission.retrievedTapedowns;
    delete sensorSubmission.instrument_status;
    sensorStatusSubmission.forEach(function(instrument, i){
      if(String(instrument.status_type_id) !== statusID){
        // 1: deployed, 2: retrieved, 3: lost
        delete sensorStatusSubmission[i];
      }
    })
    sensorStatusSubmission = sensorStatusSubmission[0];
    console.log(this.returnData);
    const updateInstrument = await new Promise<string>(resolve => this.sensorEditService.putInstrument(sensorSubmission.instrument_id, sensorSubmission).subscribe(results => {
      console.log(results);
      // need to reorder
      this.returnData = results;
      this.returnData.sensorType = sensorSubmission.sensor_type_id !== null && sensorSubmission.sensor_type_id !== 0 ? this.sensorTypes.filter(function (i) { return i.sensor_type_id === sensorSubmission.sensor_type_id; })[0].sensor : "";
      this.returnData.deploymentType = sensorSubmission.deployment_type_id !== null && sensorSubmission.deployment_type_id !== 0 ? this.deploymentTypes.filter(function (i) { return i.deployment_type_id === sensorSubmission.deployment_type_id; })[0].method : "";
      this.returnData.instCollection = sensorSubmission.inst_collection_id !== null && sensorSubmission.inst_collection_id !== 0 ? this.collectConds.filter(function (i) { return i.id === sensorSubmission.inst_collection_id; })[0].condition : "";
      this.returnData.housingType = sensorSubmission.housing_type_id !== null && sensorSubmission.housing_type_id !== 0 ? this.housingTypes.filter(function (i) { return i.housing_type_id === sensorSubmission.housing_type_id; })[0].type_name : "";
      this.returnData.sensorBrand = sensorSubmission.sensor_brand_id !== null && sensorSubmission.sensor_brand_id !== 0 ? this.sensorBrands.filter(function (i) { return i.sensor_brand_id === sensorSubmission.sensor_brand_id; })[0].brand_name : "";
      // Deployed can't change statusType
      // if(this.sensor.statusType === "Deployed"){
      //   this.returnData.statusType = this.sensor.statusType;
      // }else if (this.sensor.statusType === "Lost" || this.sensor.statusType === "Retrieved"){
      //   this.returnData.statusType = sensorSubmission.statusType;
      // }
      this.returnData.eventName = this.sensor.eventName;
      console.log(this.returnData);
      // convert to UTC
      sensorStatusSubmission.time_stamp = this.timezonesService.convertTimezone(sensorStatusSubmission.time_zone, sensorStatusSubmission.time_stamp, sensorStatusSubmission.minute)
      delete sensorStatusSubmission.ampm; delete sensorStatusSubmission.hour; delete sensorStatusSubmission.minute; delete sensorStatusSubmission.utc_preview;
      
      this.returnData.instrument_status = this.sensor.instrument_status;
      this.sensorEditService.putInstrumentStatus(sensorStatusSubmission.instrument_status_id, sensorStatusSubmission).subscribe(results => {
        console.log(results);
        for(let statusType of self.allStatusTypes){
          if(statusType.status_type_id === results.status_type_id) {
            results.status = statusType.status;
          }
        }
        console.log(this.sensor.instrument_status);
        this.sensor.instrument_status.forEach(function(inst_status, i){
          if(inst_status.instrument_status_id === results.instrument_status_id){
            self.returnData.instrument_status[i] = results;
          }
        })
        let tapedownsToAdd = [];
        let tapedownsToRemove = [];
        let tapedownsToUpdate = [];
        if(statusID === "1"){
          tapedownsToAdd = this.addTapedowns(this.initDeployedTapedowns, deployedTapedowns);
          tapedownsToRemove = this.deleteTapedowns(this.initDeployedTapedowns, deployedTapedowns);
          tapedownsToUpdate = this.updateTapedowns(this.initDeployedTapedowns, deployedTapedowns);
        }else if(statusID === "2"){
          tapedownsToAdd = this.addTapedowns(this.initRetrievedTapedowns, retrievedTapedowns);
          tapedownsToRemove = this.deleteTapedowns(this.initRetrievedTapedowns, retrievedTapedowns);
          tapedownsToUpdate = this.updateTapedowns(this.initRetrievedTapedowns, retrievedTapedowns);
        }else if(statusID === "3"){
          tapedownsToAdd = this.addTapedowns(this.initLostTapedowns, lostTapedowns);
          tapedownsToRemove = this.deleteTapedowns(this.initLostTapedowns, lostTapedowns);
          tapedownsToUpdate = this.updateTapedowns(this.initLostTapedowns, lostTapedowns);
        }
        // Delete tapedowns
        tapedownsToRemove.forEach(tapedown => {
          this.sensorEditService.deleteOPMeasure(tapedown.op_measurements_id).subscribe(result => {
            console.log(result);
          })
        })
        // Add tapedowns
        tapedownsToAdd.forEach(tapedown => {
          this.sensorEditService.addOPMeasure(tapedown).subscribe(result => {
            console.log(result);
          })
        })
        // Update existing tapedowns
        tapedownsToUpdate.forEach(tapedown => {
          this.sensorEditService.updateOPMeasure(tapedown.op_measurements_id, tapedown).subscribe(result => {
            console.log(result);
          })
        })
        resolve(updateInstrument);
      })
    }));
    promises.push(updateInstrument);

    Promise.all(promises).then(() => {
      this.loading = false;
      // re-initialize form with new sensor data
      this.sensor = this.returnData;
      this.createTapedownTable;
      this.setTimeAndDate();
      this.initForm();
      alert("Sensor saved successfully.")
      return;
    });

  }

  addTapedowns(initTapedowns, changedTapedowns) {
    let initIDs = [];
    let changedIDs = [];
    let add = [];
    initTapedowns.forEach(function(tapedown) {
      initIDs.push(tapedown.op_measurements_id);
    })
    changedTapedowns.forEach(function(tapedown) {
      changedIDs.push(tapedown.op_measurements_id);
    })
    if(initTapedowns !== changedTapedowns){ 
      for(let tapedown of changedTapedowns){
        // If changed ID is not in initIDs, add
        if(!initIDs.join(',').includes(tapedown.op_measurements_id)){
          add.push(tapedown);
        }
      }
    }
    return add;
  }

  deleteTapedowns(initTapedowns, changedTapedowns) {
    let initIDs = [];
    let changedIDs = [];
    let remove = [];
    initTapedowns.forEach(function(tapedown) {
      initIDs.push(tapedown.op_measurements_id);
    })
    changedTapedowns.forEach(function(tapedown) {
      changedIDs.push(tapedown.op_measurements_id);
    })
    if(initTapedowns !== changedTapedowns){
      for(let id of initIDs){
        // If initID is not in changedIDs, delete
        if(!changedIDs.join(',').includes(id)){
          remove.push(id);
        }
      }
    }
    return remove;
  }

  updateTapedowns(initTapedowns, changedTapedowns) {
    let initIDs = [];
    let update = [];
    initTapedowns.forEach(function(tapedown) {
      initIDs.push(tapedown.op_measurements_id);
    })
    for(let tapedown of changedTapedowns){
      // If IDs are in both, put in case info changed
      if(initIDs.join(',').includes(tapedown.op_measurements_id)){
        update.push(tapedown);
      }
    }
    return update;
  }
}
