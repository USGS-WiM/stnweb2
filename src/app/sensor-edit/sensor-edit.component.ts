import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorEditService } from '@app/services/sensor-edit.service';
import { SiteService } from '@app/services/site.service';

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
  public opsPresent = false;
  public deployedTapedowns = [];
  public retrievedTapedowns = [];
  public lostTapedowns = [];
  public initRefMarks = [];

  constructor(
    private dialogRef: MatDialogRef<SensorEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sensorEditService: SensorEditService,
    public siteService: SiteService,
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
    'FileDate',
    'FileName',
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
    // this.setTimeAndDate();
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
    this.siteService.getVDatumLookup()
      .subscribe((results) => {
        this.vDatumList = results;
      })
  }

  // setTimeAndDate() {
  //   this.sensor.instrument_status.forEach(function(instrument){
  //     // hour
  //     let hour = (instrument.time_stamp.split('T')[1]).split(':')[0];
  //     if(hour > 12){
  //       // instrument.time_stamp.hour = hour - 12;
  //     }else{
  //       instrument.time_stamp.hour = hour;
  //     }
  //     // minute
  //   })
  // }

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

    function getTapedowns(tapedownArray, instrument){
      if(instrument.vdatum !== undefined && instrument.vdatum !== ''){
        tapedownArray.push({elevation: instrument.vdatum});
      }
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
              tapedownArray.forEach(function(tapedown){
                self.initRefMarks.push(tapedown.rmName);
              })
              self.form.controls.refMarks.setValue(self.initRefMarks);
              if(objectivePoints.elev_ft !== undefined){
                tapedownArray[0].elevation = objectivePoints.elev_ft + " " + instrument.vdatum;
              }
            })
          }
        });
    }

    this.sensor.instrument_status.forEach(function(instrument){
      if(instrument.status === 'Deployed'){
        getTapedowns(self.deployedTapedowns, instrument);
      }
      else if (instrument.status === 'Retrieved'){
        getTapedowns(self.retrievedTapedowns, instrument);
      }
      else if (instrument.status === 'Lost'){
        getTapedowns(self.lostTapedowns, instrument);
      }
    })
  }

  initForm() {
    this.form = new FormGroup({
      sensor_type_id: new FormControl(this.sensor.sensor_type_id !== undefined && this.sensor.sensor_type_id !== "" ? this.sensor.sensor_type_id : null, Validators.required),
      sensor_brand_id: new FormControl(this.sensor.sensor_brand_id !== undefined && this.sensor.sensor_brand_id !== "" ? this.sensor.sensor_brand_id : null, Validators.required),
      serial_number: new FormControl(this.sensor.serial_number !== undefined && this.sensor.serial_number !== "" ? this.sensor.serial_number : null, Validators.required),
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
      refMarks: new FormControl(),
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
    } as FormArray["value"];
  }

  createTapedownArray(tapedown) {
    return {
      rmName: new FormControl({value: tapedown.rmName ? tapedown.rmName: null, disabled: true}),
      elevation: new FormControl({value: tapedown.elevation ? tapedown.elevation : null, disabled: true}),
      offset_correction: new FormControl(tapedown.offset_correction ? tapedown.offset_correction: null),
      water_surface: new FormControl(tapedown.water_surface ? tapedown.water_surface : null),
      ground_surface: new FormControl(tapedown.ground_surface ? tapedown.ground_surface : null),
    } as FormArray["value"];
  }

  changeTime(instrument) {
    console.log(instrument)
    // if((instrument.time_stamp.split('T')[1]).split(':')[0] > 12){
    //   instrument.
    // }
  }

  changeTableValue(value, status){
    let newObject = {
      rmName: null,
      elevation: null,
      offset_correction: null,
      water_surface: null,
      ground_surface: null,
    }
    let self = this;

    let addTapedown = function(statusArray, controlName) {
      // If no rms, only 1 value exists
      if(statusArray.length === 0){
        newObject.rmName = value[0];
        self.data.siteRefMarks.forEach(function(mark){
          if(value[0] === mark.name){
            newObject.elevation = mark.elev_ft;
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
        addTapedown(this.retrievedTapedowns, "retrievedTapedowns");
      }
      // Remove tapedown
      else{
        let okayToDelete = confirm("Are you sure you want to remove this file?");
        if(okayToDelete){
          // remove
          this.retrievedTapedowns = [];
          this.retrievedTapedowns = [...this.retrievedTapedowns];
          self.form.controls["retrievedTapedowns"] = new FormArray(this.retrievedTapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
        }
      }
    }else if(status === "Deployed"){
      // Add tapedown
      addTapedown(this.deployedTapedowns, "deployedTapedowns");
      // Remove tapedown
    }else if(status === "Lost"){
      // Add tapedown
      addTapedown(this.lostTapedowns, "lostTapedowns");
      // Remove tapedown
    }
  }

  previewUTC(instrument) {
    console.log("preview")
    console.log(instrument)
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

  }
}
