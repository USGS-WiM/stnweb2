import { I } from '@angular/cdk/keycodes';
import { Component, ComponentFactoryResolver, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { EventService } from '@app/services/event.service';
import { SensorEditService } from '@app/services/sensor-edit.service';
import { SiteService } from '@app/services/site.service';
import { TimezonesService } from '@app/services/timezones.service';
import { DateTime } from "luxon";
import { resolve } from 'path';

@Component({
  selector: 'app-sensor-edit',
  templateUrl: './sensor-edit.component.html',
  styleUrls: ['./sensor-edit.component.scss']
})
export class SensorEditComponent implements OnInit {
  @ViewChild('retrievedTable') retrievedTable: MatTable<any>;
  @ViewChild('deployedTable') deployedTable: MatTable<any>;
  @ViewChild('lostTable') lostTable: MatTable<any>;

  public sensor;
  public form;
  public events;
  public sensorTypes;
  public sensorBrands;
  public housingTypes;
  public deploymentTypes;
  public collectConds;
  public initSensorFiles = [];
  public initNWISFiles = [];
  public vDatumList;
  public interval_unit = "sec";
  public timeZones = ['UTC', 'PST/PDT', 'MST/MDT', 'CST/CDT', 'EST/EDT'];
  public statusTypes = [{status: "Lost", status_type_id: 3}, {status: "Retrieved", status_type_id: 2}];
  public allStatusTypes = [{status: "Lost", status_type_id: 3}, {status: "Retrieved", status_type_id: 2}, {status: "Deployed", status_type_id: 1}];
  public opsPresent = false;
  public initDeployedTapedowns = [];
  public initRetrievedTapedowns = [];
  public initLostTapedowns = [];
  public initDeployedForm = [];
  public initRetrievedForm = [];
  public initLostForm = [];
  public deployedTapedowns = [];
  public retrievedTapedowns = [];
  public lostTapedowns = [];
  public initDeployedRefMarks = [];
  public initRetrievedRefMarks = [];
  public initLostRefMarks = [];
  public newStatusID = null;
  public initStatusID;
  public role = Number(localStorage.role);
  public returnData;

  constructor(
    private dialogRef: MatDialogRef<SensorEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sensorEditService: SensorEditService,
    public siteService: SiteService,
    public eventService: EventService,
    public timezonesService: TimezonesService,
    public dialog: MatDialog,
  ) { }

  deployedExpanded = false;
  retrievedExpanded = false;
  lostExpanded = false;
  tapedownsExpanded = false;
  filesExpanded = false;
  nwisExpanded = false;
  loading = false;
  editOrCreate;

  displayedFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  displayedNWISFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  displayedTapedownColumns: string[] = [
    'ReferenceDatum',
    'Elevation',
    'OffsetCorrection',
    'WaterSurface',
    'GroundSurface',
  ];

  ngOnInit(): void {
    // Copy of initial sensor
    this.sensor = JSON.parse(JSON.stringify(this.data.sensor));
    if(this.sensor !== null){
      this.editOrCreate = "Edit";
      this.tapedownsExpanded = true;
      if(this.sensor.statusType === "Deployed"){
        this.deployedExpanded = true;
        this.initStatusID = 1;
      }else if (this.sensor.statusType === "Retrieved"){
        this.retrievedExpanded = true;
        this.initStatusID = 2;
      }else if (this.sensor.statusType === "Lost"){
        this.lostExpanded = true;
        this.initStatusID = 3;
      }

      this.returnData = this.sensor;
      if(this.data.siteRefMarks.length > 0){
        this.opsPresent = true;
      }

      if(this.role === 1){
        this.getEventList();
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
    }else{
      this.editOrCreate = "Create";
      this.initStatusID = 1;
      this.sensor = {
        event_id: this.data.event_id,
        eventName: this.data.event,
        instrument_status: [],
        statusType: "Deployed",
      };
      let newDate = new Date();
      let isoDate = newDate.toISOString();
      let utcDate = newDate.toUTCString();
      //displaying date / time in user's timezone
      this.sensor.instrument_status = [{
        time_stamp: isoDate,
        time_zone: "UTC", //will be converted to utc on post
        member_id: JSON.parse(localStorage.getItem('currentUser')).member_id, // member logged in is deploying it
        status: "Deployed",
        status_type_id: 1,
        utc_preview: utcDate,
      }]
      this.sensor.instrument_status[0].member_name = JSON.parse(localStorage.getItem('currentUser')).fname + " " + JSON.parse(localStorage.getItem('currentUser')).lname; 
      this.deployedExpanded = true;
      this.getSensorTypes();
      this.getSensorBrands();
      this.getHousingTypes();
      this.getDeploymentTypes();
      this.getVDatums();
      this.setTimeAndDate();
      this.collectConditionLookup();
      this.initForm();
    }
  }

  getEventList() {
    this.eventService.getAllEvents().subscribe(results => {
      this.events = results;
    })
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
      // Get hours, minutes and ampm for datepicker
      // hour
      let hour = (instrument.time_stamp.split('T')[1]).split(':')[0];
      if(hour > 12){
        self.sensor.instrument_status[i].hour = String(hour - 12).padStart(2, '0');
        self.sensor.instrument_status[i].ampm = "PM";
      }else{
        if(String(hour) === '00'){
          self.sensor.instrument_status[i].hour = '12';
          self.sensor.instrument_status[i].ampm = "AM";
        }else{
          self.sensor.instrument_status[i].hour = String(hour).padStart(2, '0');
          self.sensor.instrument_status[i].ampm = "AM";
        }
      }
      // minute
      let minute = instrument.time_stamp.split('T')[1].split(':')[1];
      let second = instrument.time_stamp.split('T')[1].split(':')[2];
      self.sensor.instrument_status[i].minute = String(minute).padStart(2, '0');
      let timestamp = instrument.time_stamp.split("T")[0];
      timestamp = timestamp.split("-");
      let day = timestamp[0]
      let month = timestamp[1]
      let year = timestamp[2]
      timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + hour + ":" + self.sensor.instrument_status[i].minute;
      // UTC Preview
      // If Create, utc string already set
      if(self.editOrCreate === "Edit"){
        let utcDate = new Date(Date.UTC(Number(day), Number(month) - 1, Number(year), Number(hour), Number(self.sensor.instrument_status[i].minute)));
        instrument.utc_preview = new Date(utcDate).toUTCString();
      }
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

  getTapedowns(tapedownArray, instrument, controlName, initForm){
    let self = this;
    self.siteService
    .getOPMeasurements(instrument.instrument_status_id)
    .subscribe((results) => {
          results.forEach(function(result, i){
              if (tapedownArray[i] === undefined){
                tapedownArray[i] = {
                  ground_surface: null,
                  water_surface: null,
                  offset_correction: null,
                  op_measurements_id: null,
                  op_name: null,
                  elevation: null,
                  vdatum: null,
                  instrument_status_id: null,
                  objective_point_id: null,
                };
              }
              tapedownArray[i].ground_surface = result.ground_surface;
              tapedownArray[i].water_surface = result.water_surface;
              tapedownArray[i].offset_correction = result.offset_correction;
              tapedownArray[i].op_measurements_id = result.op_measurements_id;
              tapedownArray[i].objective_point_id = result.objective_point_id;
              tapedownArray[i].instrument_status_id = instrument.instrument_status_id;
              // get reference datum info using objective_point_id
              self.siteService
              .getOPInfo(result.objective_point_id)
              .subscribe((objectivePoints) => {
                tapedownArray[i].op_name = objectivePoints.name;
                if(objectivePoints.elev_ft !== undefined){
                  tapedownArray[i].elevation = objectivePoints.elev_ft;
                }
                if(instrument.vdatum !== undefined && instrument.vdatum !== ''){
                  tapedownArray[i].vdatum = instrument.vdatum;
                }else if (instrument.vdatum_id !== undefined){
                  for(let vdatum of self.vDatumList){
                    if(vdatum.datum_id === instrument.vdatum_id){
                      tapedownArray[i].vdatum = vdatum.datum_name;
                    }
                  }
                }
                if(controlName === "deployedTapedowns"){
                  tapedownArray.forEach(function(tapedown){
                    self.initDeployedRefMarks.push(tapedown.op_name);
                  })
                  self.form.controls.deployedRefMarks.setValue(self.initDeployedRefMarks);
                  self.initDeployedTapedowns = JSON.parse(JSON.stringify(tapedownArray));
                }else if(controlName === "retrievedTapedowns"){
                  tapedownArray.forEach(function(tapedown){
                    self.initRetrievedRefMarks.push(tapedown.op_name);
                  })
                  self.form.controls.retrievedRefMarks.setValue(self.initRetrievedRefMarks);
                  self.initRetrievedTapedowns = JSON.parse(JSON.stringify(tapedownArray));
                }else if(controlName === "lostTapedowns"){
                  tapedownArray.forEach(function(tapedown){
                    self.initLostRefMarks.push(tapedown.op_name);
                  })
                  self.form.controls.lostRefMarks.setValue(self.initLostRefMarks);
                  self.initLostTapedowns = JSON.parse(JSON.stringify(tapedownArray));
                }
              })
          })
          self.form.controls[controlName] = new FormArray(tapedownArray.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
          // save initial tapedown values in case of reset
          self.form.controls[controlName].controls.forEach(function(formgroup, i){
            initForm.push({formgroup: formgroup.getRawValue(), id: i});
          })
          if(self.retrievedTable !== undefined){self.retrievedTable.renderRows()};
          if(self.deployedTable !== undefined){self.deployedTable.renderRows()};
          if(self.lostTable !== undefined){self.lostTable.renderRows()};
    });
  }

  createTapedownTable(){
    let self = this;

    this.sensor.instrument_status.forEach(function(instrument){
      if(instrument.status === 'Deployed'){
        self.getTapedowns(self.deployedTapedowns, instrument, "deployedTapedowns", self.initDeployedForm);
      }
      else if (instrument.status === 'Retrieved'){
        self.getTapedowns(self.retrievedTapedowns, instrument, "retrievedTapedowns", self.initRetrievedForm);
      }
      else if (instrument.status === 'Lost'){
        self.getTapedowns(self.lostTapedowns, instrument, "lostTapedowns", self.initLostForm);
      }
    })
  }

  initForm() {
    let self = this;
    this.form = new FormGroup({
      event_id: new FormControl(this.sensor.event_id !== undefined && this.sensor.event_id !== "" ? this.sensor.event_id : null),
      instrument_id: new FormControl(this.sensor.instrument_id !== undefined && this.sensor.instrument_id !== "" ? this.sensor.instrument_id : null),
      sensor_type_id: new FormControl(this.sensor.sensor_type_id !== undefined && this.sensor.sensor_type_id !== "" ? this.sensor.sensor_type_id : null, Validators.required),
      sensor_brand_id: new FormControl(this.sensor.sensor_brand_id !== undefined && this.sensor.sensor_brand_id !== "" ? this.sensor.sensor_brand_id : null, Validators.required),
      serial_number: new FormControl(this.sensor.serial_number !== undefined && this.sensor.serial_number !== "" ? this.sensor.serial_number : null, Validators.required),
      housing_serial_number: new FormControl(this.sensor.housing_serial_number !== undefined && this.sensor.housing_serial_number !== "" ? this.sensor.housing_serial_number : null),
      housing_type_id: new FormControl(this.sensor.housing_type_id !== undefined && this.sensor.housing_type_id !== "" ? this.sensor.housing_type_id : null),
      vented: new FormControl(this.sensor.vented !== undefined && this.sensor.vented !== "" ? this.sensor.vented : null),
      deployment_type_id: new FormControl(this.sensor.deployment_type_id !== undefined && this.sensor.deployment_type_id !== "" ? this.sensor.deployment_type_id : null),
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

    this.sensor.instrument_status.forEach(function(instrument){
      if(instrument.time_zone !== 'UTC'){
        self.previewUTC(instrument);
      }
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

  createInstrumentArray(instrument) {
    let timezone = this.timezonesService.matchTimezone(instrument.time_zone);
    return {
      instrument_id: new FormControl(this.sensor.instrument_id ? this.sensor.instrument_id: null),
      instrument_status_id: new FormControl(instrument.instrument_status_id ? instrument.instrument_status_id: null),
      time_stamp: new FormControl(instrument.time_stamp ? instrument.time_stamp: null),
      time_zone: new FormControl(timezone ? timezone : null),
      notes: new FormControl(instrument.notes ? instrument.notes: null),
      member_id: new FormControl(instrument.member_id ? instrument.member_id : null),
      vdatum_id: new FormControl(instrument.vdatum_id ? instrument.vdatum_id : null),
      sensor_elevation: new FormControl(instrument.sensor_elevation ? instrument.sensor_elevation : null, [this.isNum()]),
      ws_elevation: new FormControl(instrument.ws_elevation ? instrument.ws_elevation : null, [this.isNum()]),
      gs_elevation: new FormControl(instrument.gs_elevation ? instrument.gs_elevation : null, [this.isNum()]),
      status_type_id: new FormControl(instrument.status_type_id ? instrument.status_type_id : null),
      hour: new FormControl(instrument.hour ? instrument.hour : null, [this.validHour()]),
      minute: new FormControl(instrument.minute ? instrument.minute : null, [this.validMin()]),
      ampm: new FormControl(instrument.ampm ? instrument.ampm : null),
    } as FormArray["value"];
  }

  createTapedownArray(tapedown) {
    return {
      ground_surface: new FormControl(tapedown.ground_surface ? tapedown.ground_surface : null, [this.isNum()]),
      water_surface: new FormControl(tapedown.water_surface ? tapedown.water_surface : null, [this.isNum()]),
      offset_correction: new FormControl(tapedown.offset_correction ? tapedown.offset_correction: null, [this.isNum()]),
      op_measurements_id: new FormControl(tapedown.op_measurements_id ? tapedown.op_measurements_id : null),
      op_name: new FormControl({value: tapedown.op_name ? tapedown.op_name: null, disabled: true}),
      vdatum: new FormControl({value: tapedown.vdatum ? tapedown.vdatum: null, disabled: true}),
      elevation: new FormControl({value: tapedown.elevation ? tapedown.elevation : null, disabled: true}, [this.isNum()]),
      objective_point_id: new FormControl(tapedown.objective_point_id ? tapedown.objective_point_id: null),
      instrument_status_id: new FormControl(tapedown.instrument_status_id ? tapedown.instrument_status_id: null),
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

  statusChanged(value){
    if(this.initStatusID !== value){
      this.newStatusID = value;
    }else{
      this.newStatusID = null;
    }
  }

  changeTableValue(value, status){
    let newObject = {
      ground_surface: null,
      water_surface: null,
      offset_correction: null,
      op_measurements_id: null,
      op_name: null,
      elevation: null,
      vdatum: null,
      instrument_status_id: null,
      objective_point_id: null,
    }
    let self = this;

    let addTapedown = function(statusArray, controlName, status, initRefMarks, initTapedowns, table) {
      // If no rms, only 1 value exists
      if(statusArray.length === 0){
        newObject.op_name = value[0];
        self.data.siteRefMarks.forEach(function(mark){
          if(value[0] === mark.name){
            if(mark.elevation){
              newObject.elevation = mark.elev_ft;
            }
            newObject.vdatum = mark.vdatum;
            newObject.objective_point_id = mark.objective_point_id;
            self.form.controls["instrument_status"].controls.forEach(function(instrument, i){
              for(let statusType of self.allStatusTypes){
                if(instrument.controls.status_type_id.value === statusType.status_type_id){
                  statusType.status_type_id;
                  if(statusType.status === status){
                    self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(mark.vdatum_id);
                    newObject.instrument_status_id = instrument.controls["instrument_status_id"].value;
                  }
                }
              }
            });
            if(initRefMarks.join(',').includes(mark.name)){
              // Use existing op_measurements_id
              for(let tapedown of initTapedowns){
                if(tapedown.op_name === mark.name){
                  newObject.op_measurements_id = tapedown.op_measurements_id;
                }
              }
            }
            statusArray.push(newObject);
          }
        })
      }else{
        let opNames = [];
        // Add to table
        statusArray.forEach(function(status){
          opNames.push(status.op_name);
        })
        value.forEach(function(name){
          if(!opNames.join(',').includes(name)){
            newObject.op_name = name;
            self.data.siteRefMarks.forEach(function(mark){
              if(name === mark.name){
                newObject.elevation = mark.elev_ft;
                newObject.vdatum = mark.vdatum;
                newObject.objective_point_id = mark.objective_point_id;
                self.form.controls["instrument_status"].controls.forEach(function(instrument, i){
                  for(let statusType of self.allStatusTypes){
                    if(instrument.controls.status_type_id.value === statusType.status_type_id){
                      if(statusType.status === status){
                        self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(mark.vdatum_id);
                        newObject.instrument_status_id = instrument.controls["instrument_status_id"].value;
                      }
                    }
                  }
                });
                if(initRefMarks.join(',').includes(mark.name)){
                  // Use existing op_measurements_id
                  for(let tapedown of initTapedowns){
                    if(tapedown.op_name === mark.name){
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
      if(table !== undefined){table.renderRows()};
      self.form.controls[controlName] = new FormArray(statusArray.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
    }

    if(status === "Retrieved"){
      // Add tapedown
      if(value.length > this.retrievedTapedowns.length){
        addTapedown(this.retrievedTapedowns, "retrievedTapedowns", status, this.initRetrievedRefMarks, this.initRetrievedTapedowns, this.retrievedTable);
      }
      // Remove tapedown
      else{
        let index;
        let dialogRef = this.dialog.open(ConfirmComponent, {
          data: {
            title: "",
            titleIcon: "",
            message: "Are you sure you want to remove this OP Measurement from this sensor?",
            confirmButtonText: "OK",
            showCancelButton: true,
          },
        });
        
        dialogRef.afterClosed().subscribe((result) => {
          // Confirm returns true
          if(result){
            // remove
            index = this.retrievedTapedowns.findIndex(j => !value.join(',').includes(j.op_name));
            this.retrievedTapedowns.splice(index, 1);
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
        });
      }
    }else if(status === "Deployed"){
        // Add tapedown
        if(value.length > this.deployedTapedowns.length){   
          addTapedown(this.deployedTapedowns, "deployedTapedowns", status, this.initDeployedRefMarks, this.initDeployedTapedowns, this.deployedTable);
        }
        // Remove tapedown
        else{
          let index;
          
          let dialogRef = this.dialog.open(ConfirmComponent, {
            data: {
              title: "",
              titleIcon: "",
              message: "Are you sure you want to remove this OP Measurement from this sensor?",
              confirmButtonText: "OK",
              showCancelButton: true,
            },
          });
          
          dialogRef.afterClosed().subscribe((result) => {
            if(result){
              // remove
              index = this.deployedTapedowns.findIndex(j => !value.join(',').includes(j.op_name));
              this.deployedTapedowns.splice(index, 1);
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
          });
        }
    }else if(status === "Lost"){
      // Add tapedown
      if(value.length > this.lostTapedowns.length){   
        addTapedown(this.lostTapedowns, "lostTapedowns", status, this.initLostRefMarks, this.initLostTapedowns, this.lostTable);
      }
      // Remove tapedown
      else{
        let index;
        let dialogRef = this.dialog.open(ConfirmComponent, {
          data: {
            title: "",
            titleIcon: "",
            message: "Are you sure you want to remove this OP Measurement from this sensor?",
            confirmButtonText: "OK",
            showCancelButton: true,
          },
        });
        
        dialogRef.afterClosed().subscribe((result) => {
          if(result){
            // remove
            index = this.lostTapedowns.findIndex(j => !value.join(',').includes(j.op_name));
            this.lostTapedowns.splice(index, 1);
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
        });
      }
    }
  }

  setTimeZone(instrument) {
    this.previewUTC(instrument);
  }

  previewUTC(instrument) {
    let self = this;
    this.form.controls["instrument_status"].controls.forEach(function(instrument_status, i){
      if(instrument_status.controls.status_type_id.value === instrument.status_type_id){
        if(self.form.controls["instrument_status"].controls[i].controls.minute.valid && self.form.controls["instrument_status"].controls[i].controls.hour.valid){
          let hour = instrument_status.value.ampm === "PM" ? (Number(instrument_status.value.hour) + 12) : instrument_status.value.hour;
          let minute = String(instrument_status.value.minute).padStart(2, '0');
          if(String(hour) === '12' && instrument_status.value.ampm === 'AM'){
            hour = '00';
          }else if (String(hour) === '24' && instrument_status.value.ampm === 'PM'){
            hour = '12';
          }
          else{
            hour = String(hour).padStart(2, '0');
          }
          let initDate;
          try{
            initDate = instrument_status.value.time_stamp.split('T')[0];
          }
          catch{
            // If date changed using Datepicker, format will need to be changed
            initDate = DateTime.fromJSDate(instrument_status.value.time_stamp).toString();
            initDate = initDate.split('T')[0];
          }
          let date = initDate + "T" + hour + ":" + minute + ":00";
          // Convert to UTC
          let utcDate;
          utcDate = self.timezonesService.convertTimezone(instrument_status.controls.time_zone.value, date, minute);
          let utchour = (utcDate.split('T')[1]).split(':')[0].padStart(2, '0');
          self.form.controls["instrument_status"].controls[i].controls["time_stamp"].setValue(date);
          self.form.controls["instrument_status"].controls[i].controls["minute"].setValue(minute);
          let timestamp = utcDate.split("T")[0];
          timestamp = timestamp.split("-");
          let day = timestamp[0]
          let month = timestamp[1]
          let year = timestamp[2]
          timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + utchour + ":" + minute;
          // UTC Preview
          let utcPreview = new Date(Date.UTC(Number(day), Number(month) - 1, Number(year), Number(utchour), Number(minute)));
          instrument.utc_preview = new Date(utcPreview).toUTCString();
        }
      }
    });
  }

  ventedChange(value){
    this.form.controls.vented.setValue(value);
  }

  intervalUnitChange(value) {
    this.interval_unit = value;
  }

  // Reset canceled form to initial values
  cancelForm(statusType) {
    let self = this;
    if(statusType === "Deployed") {

      this.form.patchValue({
        event_id: (this.sensor.event_id !== undefined && this.sensor.event_id !== "" ? this.sensor.event_id : null),
        instrument_id: (this.sensor.instrument_id !== undefined && this.sensor.instrument_id !== "" ? this.sensor.instrument_id : null),
        sensor_type_id: (this.sensor.sensor_type_id !== undefined && this.sensor.sensor_type_id !== "" ? this.sensor.sensor_type_id : null),
        sensor_brand_id: (this.sensor.sensor_brand_id !== undefined && this.sensor.sensor_brand_id !== "" ? this.sensor.sensor_brand_id : null),
        serial_number: (this.sensor.serial_number !== undefined && this.sensor.serial_number !== "" ? this.sensor.serial_number : null),
        housing_serial_number: (this.sensor.housing_serial_number !== undefined && this.sensor.housing_serial_number !== "" ? this.sensor.housing_serial_number : null),
        housing_type_id: (this.sensor.housing_type_id !== undefined && this.sensor.housing_type_id !== "" ? this.sensor.housing_type_id : null),
        vented: (this.sensor.vented !== undefined && this.sensor.vented !== "" ? this.sensor.vented : null),
        deployment_type_id: (this.sensor.deployment_type_id !== undefined && this.sensor.deployment_type_id !== "" ? this.sensor.deployment_type_id : null),
        location_description: (this.sensor.location_description !== undefined && this.sensor.location_description !== "" ? this.sensor.location_description : null),
        interval: (this.sensor.interval !== undefined && this.sensor.interval !== "" ? this.sensor.interval : null),
        site_id: (this.sensor.site_id !== undefined && this.sensor.site_id !== "" ? this.sensor.site_id : null),
        inst_collection_id: (this.sensor.inst_collection_id !== undefined && this.sensor.inst_collection_id !== "" ? this.sensor.inst_collection_id : null),
        deployedRefMarks: this.initDeployedRefMarks,
      })

      if(this.initDeployedTapedowns.length > 0){
        // Reset to inital tapedowns
        if(this.initDeployedTapedowns.length === this.form.controls["deployedTapedowns"].controls.length){
          this.form.controls["deployedTapedowns"].controls.forEach(function(control, i){
            self.initDeployedForm.forEach(function(value){
              if(value.id === i){
                control.reset(value.formgroup);
              }
            })
          })
        }else{
          this.deployedTapedowns = this.initDeployedTapedowns;
          this.deployedTapedowns = [...this.deployedTapedowns];
          this.form.controls["deployedTapedowns"] = new FormArray(this.deployedTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
        }
      }else{
        // remove
        this.deployedTapedowns = [];
        this.deployedTapedowns = [...this.deployedTapedowns];
        self.form.controls["deployedTapedowns"] = new FormArray(this.deployedTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
      }
    }else if(statusType === "Retrieved") {
      this.form.patchValue({
        retrievedRefMarks: this.initRetrievedRefMarks,
      })

      if(this.initRetrievedTapedowns.length > 0){
        // Reset to inital tapedowns
        if(this.initRetrievedTapedowns.length === this.form.controls["retrievedTapedowns"].controls.length){
          this.form.controls["retrievedTapedowns"].controls.forEach(function(control, i){
            self.initRetrievedForm.forEach(function(value){
              if(value.id === i){
                control.reset(value.formgroup);
              }
            })
          })
        }else{
          this.retrievedTapedowns = this.initRetrievedTapedowns;
          this.retrievedTapedowns = [...this.retrievedTapedowns];
          this.form.controls["retrievedTapedowns"] = new FormArray(this.retrievedTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
        }
      }else{
        // remove
        this.retrievedTapedowns = [];
        this.retrievedTapedowns = [...this.retrievedTapedowns];
        self.form.controls["retrievedTapedowns"] = new FormArray(this.retrievedTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
      }
    }else if(statusType === "Lost") {
      this.form.patchValue({
        lostRefMarks: this.initLostRefMarks,
      })

      if(this.initLostTapedowns.length > 0){
        // Reset to inital tapedowns
        if(this.initLostTapedowns.length === this.form.controls["lostTapedowns"].controls.length){
          this.form.controls["lostTapedowns"].controls.forEach(function(control, i){
            self.initLostForm.forEach(function(value){
              if(value.id === i){
                control.reset(value.formgroup);
              }
            })
          })
        }else{
          this.lostTapedowns = this.initLostTapedowns;
          this.lostTapedowns = [...this.lostTapedowns];
          this.form.controls["lostTapedowns"] = new FormArray(this.lostTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
        }
      }
      else{
        // remove
        this.lostTapedowns = [];
        this.lostTapedowns = [...this.lostTapedowns];
        self.form.controls["lostTapedowns"] = new FormArray(this.lostTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
      }
    }
    this.sensor.instrument_status.forEach(function(instrument, i){
      if(instrument.status === statusType){
        self.form.controls["instrument_status"].controls[i].controls["instrument_id"].setValue(self.sensor.instrument_id ? self.sensor.instrument_id: null);
        self.form.controls["instrument_status"].controls[i].controls["time_stamp"].setValue(instrument.time_stamp ? instrument.time_stamp: null);
        self.form.controls["instrument_status"].controls[i].controls["time_zone"].setValue(instrument.time_zone ? instrument.time_zone : null);
        self.form.controls["instrument_status"].controls[i].controls["notes"].setValue(instrument.notes ? instrument.notes: null);
        self.form.controls["instrument_status"].controls[i].controls["member_id"].setValue(instrument.member_id ? instrument.member_id : null);
        self.form.controls["instrument_status"].controls[i].controls["vdatum_id"].setValue(instrument.vdatum_id ? instrument.vdatum_id : null);
        self.form.controls["instrument_status"].controls[i].controls["sensor_elevation"].setValue(instrument.sensor_elevation ? instrument.sensor_elevation : null);
        self.form.controls["instrument_status"].controls[i].controls["ws_elevation"].setValue(instrument.ws_elevation ? instrument.ws_elevation : null);
        self.form.controls["instrument_status"].controls[i].controls["gs_elevation"].setValue(instrument.gs_elevation ? instrument.gs_elevation : null);
        self.form.controls["instrument_status"].controls[i].controls["status_type_id"].setValue(instrument.status_type_id ? instrument.status_type_id : null);
        self.form.controls["instrument_status"].controls[i].controls["hour"].setValue(instrument.hour ? instrument.hour : null);
        self.form.controls["instrument_status"].controls[i].controls["minute"].setValue(instrument.minute ? instrument.minute : null);
        self.form.controls["instrument_status"].controls[i].controls["ampm"].setValue(instrument.ampm ? instrument.ampm : null);
        self.setTimeAndDate();
      }
    })
  }

  submit(statusID) {
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.loading = true;

      // If interval in min, convert to sec before submitting
      if(this.interval_unit === "min"){
        this.form.controls.interval.setValue(this.form.controls.interval.value * 60);
      }
      this.sendRequests(statusID);
    }else{
      this.loading = false;
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "",
          titleIcon: "close",
          message: "Some required sensor fields are missing or incorrect.  Please fix these fields before submitting.",
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
    }
  }

  async sendRequests(statusID) {
    let self = this;

    // Copy form value object and delete extra fields, include disabled form values in submission
    let sensorSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    let sensorStatusSubmission = JSON.parse(JSON.stringify(this.form.controls.instrument_status.getRawValue()));

    let deployedTapedowns = sensorSubmission.deployedTapedowns;
    let retrievedTapedowns = sensorSubmission.retrievedTapedowns;
    let lostTapedowns = sensorSubmission.lostTapedowns;

    deployedTapedowns.forEach((i) => delete i.elevation);
    retrievedTapedowns.forEach((i) => delete i.elevation);
    lostTapedowns.forEach((i) => delete i.elevation);

    let deployedRefMarks = sensorSubmission.deployedRefMarks;
    let retrievedRefMarks = sensorSubmission.retrievedRefMarks;
    let lostRefMarks = sensorSubmission.lostRefMarks;

    // Put instrument
    delete sensorSubmission.lostRefMarks; delete sensorSubmission.deployedRefMarks; delete sensorSubmission.retrievedRefMarks; delete sensorSubmission.lostTapedowns; delete sensorSubmission.deployedTapedowns; delete sensorSubmission.retrievedTapedowns;
    delete sensorSubmission.instrument_status;
    // Copy sensor status submission
    let sensorStatusCopy = JSON.parse(JSON.stringify(sensorStatusSubmission));
    let index;
    sensorStatusCopy.forEach(function(instrument){
      if(statusID === "1"){
        if(String(instrument.status_type_id) !== statusID){
          // 1: deployed, 2: retrieved, 3: lost
          index = sensorStatusSubmission.findIndex(j => j.status_type_id === instrument.status_type_id);
          sensorStatusSubmission.splice(index, 1);
        }
      }else{
        if(self.newStatusID !== null){
          if(instrument.status_type_id !== self.newStatusID && String(self.newStatusID) !== statusID){
            // 1: deployed, 2: retrieved, 3: lost
            index = sensorStatusSubmission.findIndex(j => j.status_type_id === instrument.status_type_id);
            sensorStatusSubmission.splice(index, 1);
          }
        }else{
          if(String(instrument.status_type_id) !== statusID && String(self.newStatusID) !== statusID){
              // 1: deployed, 2: retrieved, 3: lost
              index = sensorStatusSubmission.findIndex(j => j.status_type_id === instrument.status_type_id);
              sensorStatusSubmission.splice(index, 1);
            }
        }
      }
    })
    sensorStatusSubmission = sensorStatusSubmission[0];
    if(this.editOrCreate === "Edit"){
      const updateInstrument = new Promise<string>((resolve, reject) => this.sensorEditService.putInstrument(sensorSubmission.instrument_id, sensorSubmission).subscribe(results => {
        if(results.length !== 0){
          // Format everything to send back to site
          this.returnData = results;
          this.returnData.sensorType = sensorSubmission.sensor_type_id !== null && sensorSubmission.sensor_type_id !== 0 ? this.sensorTypes.filter(function (i) { return i.sensor_type_id === sensorSubmission.sensor_type_id; })[0].sensor : "";
          this.returnData.deploymentType = sensorSubmission.deployment_type_id !== null && sensorSubmission.deployment_type_id !== 0 ? this.deploymentTypes.filter(function (i) { return i.deployment_type_id === sensorSubmission.deployment_type_id; })[0].method : "";
          this.returnData.instCollection = sensorSubmission.inst_collection_id !== null && sensorSubmission.inst_collection_id !== 0 ? this.collectConds.filter(function (i) { return i.id === sensorSubmission.inst_collection_id; })[0].condition : "";
          this.returnData.housingType = sensorSubmission.housing_type_id !== null && sensorSubmission.housing_type_id !== 0 ? this.housingTypes.filter(function (i) { return i.housing_type_id === sensorSubmission.housing_type_id; })[0].type_name : "";
          this.returnData.sensorBrand = sensorSubmission.sensor_brand_id !== null && sensorSubmission.sensor_brand_id !== 0 ? this.sensorBrands.filter(function (i) { return i.sensor_brand_id === sensorSubmission.sensor_brand_id; })[0].brand_name : "";
          // Deployed can't change statusType
          if(this.sensor.statusType === "Deployed"){
            this.returnData.statusType = this.sensor.statusType;
          }else if (this.sensor.statusType === "Lost" || this.sensor.statusType === "Retrieved"){
            // If lost or retrieved form was submitted and status type changed
            if(statusID !== "1"){
              for(let statusType of self.allStatusTypes){
                if(statusType.status_type_id === sensorStatusSubmission.status_type_id) {
                  this.returnData.statusType = statusType.status;
                }
              }
            }else{
              this.returnData.statusType = this.sensor.statusType;
            }
          }
          this.returnData.eventName = this.sensor.eventName;
          // convert to UTC
          this.sensor.instrument_status.forEach(function(instrument_status, i){
            if(instrument_status.status_type_id === sensorStatusSubmission.status_type_id){
              sensorStatusSubmission.time_stamp = instrument_status.utc_preview;
            }
          });
          sensorStatusSubmission.time_zone = "UTC";
          delete sensorStatusSubmission.ampm; delete sensorStatusSubmission.hour; delete sensorStatusSubmission.minute; delete sensorStatusSubmission.utc_preview;
          this.returnData.instrument_status = this.sensor.instrument_status;
          this.sensorEditService.putInstrumentStatus(sensorStatusSubmission.instrument_status_id, sensorStatusSubmission).subscribe(results => {
            if(results.length !== 0){
              for(let statusType of self.allStatusTypes){
                if(statusType.status_type_id === results.status_type_id) {
                  results.status = statusType.status;
                }
              }
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
                this.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
              }else if(statusID === "2"){
                tapedownsToAdd = this.addTapedowns(this.initRetrievedTapedowns, retrievedTapedowns);
                tapedownsToRemove = this.deleteTapedowns(this.initRetrievedTapedowns, retrievedTapedowns);
                tapedownsToUpdate = this.updateTapedowns(this.initRetrievedTapedowns, retrievedTapedowns);
                this.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
              }else if(statusID === "3"){
                tapedownsToAdd = this.addTapedowns(this.initLostTapedowns, lostTapedowns);
                tapedownsToRemove = this.deleteTapedowns(this.initLostTapedowns, lostTapedowns);
                tapedownsToUpdate = this.updateTapedowns(this.initLostTapedowns, lostTapedowns);
                this.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);
              }

              resolve("Success");
            }else{
              this.dialog.open(ConfirmComponent, {
                data: {
                  title: "Error updating Instrument Status.",
                  titleIcon: "close",
                  message: null,
                  confirmButtonText: "OK",
                  showCancelButton: false,
                },
              });
              resolve("Success");
            }
          })
        }
        else{
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error updating Sensor.",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
          reject(new Error("Error updating Sensor."));
        }
      }));

      updateInstrument.then(() => {
        this.loading = false;
        let result = {result: this.returnData, editOrCreate: this.editOrCreate}
        this.dialogRef.close(result);
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully updated Sensor",
            titleIcon: "check",
            message: null,
            confirmButtonText: "OK",
            showCancelButton: false,
          },
        });
      }).catch(function(error) {
        console.log(error.message);
        self.loading = false;
      });
    }else if(this.editOrCreate === "Create"){
      sensorSubmission.site_id = this.data.site_id;
      delete sensorSubmission.instrument_id;
      /* istanbul ignore next */
      const deployInstrument = new Promise<string>((resolve, reject) => this.sensorEditService.postInstrument(sensorSubmission).subscribe(results => {
        if(results.length !== 0){
          // Format everything to send back to site
          this.returnData = results;
          this.returnData.sensorType = sensorSubmission.sensor_type_id !== null && sensorSubmission.sensor_type_id !== 0 ? this.sensorTypes.filter(function (i) { return i.sensor_type_id === sensorSubmission.sensor_type_id; })[0].sensor : "";
          this.returnData.deploymentType = sensorSubmission.deployment_type_id !== null && sensorSubmission.deployment_type_id !== 0 ? this.deploymentTypes.filter(function (i) { return i.deployment_type_id === sensorSubmission.deployment_type_id; })[0].method : "";
          this.returnData.instCollection = sensorSubmission.inst_collection_id !== null && sensorSubmission.inst_collection_id !== 0 ? this.collectConds.filter(function (i) { return i.id === sensorSubmission.inst_collection_id; })[0].condition : "";
          this.returnData.housingType = sensorSubmission.housing_type_id !== null && sensorSubmission.housing_type_id !== 0 ? this.housingTypes.filter(function (i) { return i.housing_type_id === sensorSubmission.housing_type_id; })[0].type_name : "";
          this.returnData.sensorBrand = sensorSubmission.sensor_brand_id !== null && sensorSubmission.sensor_brand_id !== 0 ? this.sensorBrands.filter(function (i) { return i.sensor_brand_id === sensorSubmission.sensor_brand_id; })[0].brand_name : "";
          // Deployed statusType
          this.returnData.statusType = this.sensor.statusType;
          this.returnData.eventName = this.sensor.eventName;
          // convert to UTC
          this.sensor.instrument_status.forEach(function(instrument_status, i){
            if(instrument_status.status_type_id === sensorStatusSubmission.status_type_id){
              sensorStatusSubmission.time_stamp = instrument_status.utc_preview;
            }
          });
          sensorStatusSubmission.time_zone = "UTC";
          delete sensorStatusSubmission.ampm; delete sensorStatusSubmission.hour; delete sensorStatusSubmission.minute; delete sensorStatusSubmission.instrument_status_id; delete sensorStatusSubmission.utc_preview;
          this.returnData.instrument_status = this.sensor.instrument_status;
          sensorStatusSubmission.instrument_id = results.instrument_id;
          this.sensorEditService.postInstrumentStatus(sensorStatusSubmission).subscribe(response => {
            if(response.length !== 0){
              for(let statusType of self.allStatusTypes){
                if(statusType.status_type_id === response.status_type_id) {
                  response.status = statusType.status;
                }
              }
              this.returnData.instrument_status[0] = response;
              let tapedownsToAdd = [];
              // No tapedowns to remove or update
              let tapedownsToRemove = [];
              let tapedownsToUpdate = [];
              
              tapedownsToAdd = this.addTapedowns(this.initDeployedTapedowns, deployedTapedowns);
              tapedownsToAdd.forEach(tapedownToAdd => {
                tapedownToAdd.instrument_status_id = response.instrument_status_id;
              });
              this.sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate);

              resolve("Success");
            }else{
              this.dialog.open(ConfirmComponent, {
                data: {
                  title: "Error saving Instrument Status.",
                  titleIcon: "close",
                  message: null,
                  confirmButtonText: "OK",
                  showCancelButton: false,
                },
              });
              resolve("Success");
            }
          })
        }
        else{
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error deploying Sensor.",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
          reject(new Error("Error deploying Sensor."));
        }
      }));

      /* istanbul ignore next */
      deployInstrument.then(() => {
        this.loading = false;
        let result = {result: this.returnData, editOrCreate: this.editOrCreate}
        this.dialogRef.close(result);
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully deployed Sensor",
            titleIcon: "check",
            message: null,
            confirmButtonText: "OK",
            showCancelButton: false,
          },
        });
      }).catch(function(error) {
        console.log(error.message);
        self.loading = false;
      });
    }

  }

  // Need to populate edit form with new tapedown info, but don't need to return them to site details component
  sendTapedownRequests(tapedownsToAdd, tapedownsToRemove, tapedownsToUpdate) {
      tapedownsToRemove.forEach(tapedownToRemove => {
        this.sensorEditService.deleteOPMeasure(tapedownToRemove).subscribe(result => {
          // Result will be null if delete worked
          if(result !== null){
            this.dialog.open(ConfirmComponent, {
              data: {
                title: "Error removing tapedown.",
                titleIcon: "close",
                message: null,
                confirmButtonText: "OK",
                showCancelButton: false,
              },
            });
          }
        });
      })

    // Add tapedowns
    tapedownsToAdd.forEach(tapedownToAdd => {
      delete tapedownToAdd.op_measurements_id;
      this.sensorEditService.addOPMeasure(tapedownToAdd).subscribe(result => {
        if(result.length === 0){
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error adding new tapedown.",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
        }
      })
    })
    // Update existing tapedowns
    tapedownsToUpdate.forEach(tapedownToUpdate => {
      this.sensorEditService.updateOPMeasure(tapedownToUpdate.op_measurements_id, tapedownToUpdate).subscribe(result => {
        if(result.length === 0){
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error updating tapedown.",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
        }
      })
    })
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