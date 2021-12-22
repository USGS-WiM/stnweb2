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
      console.log(this.collectConds)
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
      instrument_status: new FormArray(this.sensor.instrument_status.map((control) => new FormGroup(this.createInstrumentArray(control)))),
      site_id: new FormControl(this.sensor.site_id !== undefined && this.sensor.site_id !== "" ? this.sensor.site_id : null)
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
    console.log(instrument)
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
      status: new FormControl(instrument.status ? instrument.status : null),
    } as FormArray["value"];
  }

  changeTime(instrument) {
    console.log(instrument)
    // if((instrument.time_stamp.split('T')[1]).split(':')[0] > 12){
    //   instrument.
    // }
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
