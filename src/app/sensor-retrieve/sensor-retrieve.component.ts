import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { SensorEditService } from '@app/services/sensor-edit.service';
import { SiteService } from '@app/services/site.service';
import { TimezonesService } from '@app/services/timezones.service';
import { DateTime } from "luxon";

@Component({
  selector: 'app-sensor-retrieve',
  templateUrl: './sensor-retrieve.component.html',
  styleUrls: ['./sensor-retrieve.component.scss']
})
export class SensorRetrieveComponent implements OnInit {
  @ViewChild('retrievedTable') retrievedTable: MatTable<any>;
  
  private sensor;
  private sensorTypes;
  private sensorBrands;
  private housingTypes;
  private deploymentTypes;
  private vDatumList;
  private collectConds;
  private deployMember = [];
  private retrieveMemberID = JSON.parse(localStorage.getItem('currentUser')).member_id;
  private retrieveMember = JSON.parse(localStorage.getItem('currentUser')).fname + " " + JSON.parse(localStorage.getItem('currentUser')).lname;
  public form;
  private tapedowns = []; 
  private instrument;
  private opsPresent = false;
  private returnData;
  public statusTypes = [{status: "Lost", status_type_id: 3}, {status: "Retrieved", status_type_id: 2}];
  public allStatusTypes = [{status: "Lost", status_type_id: 3}, {status: "Retrieved", status_type_id: 2}, {status: "Deployed", status_type_id: 1}];
  public timeZones = ['UTC', 'PST/PDT', 'MST/MDT', 'CST/CDT', 'EST/EDT'];
  private minDate;

  constructor(
    private dialogRef: MatDialogRef<SensorRetrieveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public siteService: SiteService,
    public sensorEditService: SensorEditService,
    public timezonesService: TimezonesService,
  ) { }

  loading = false;
  deployedExpanded = false;
  retrievalExpanded = true;

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

    if(this.data.siteRefMarks.length > 0){
      this.opsPresent = true;
    }
    
    this.minDate = new Date(this.sensor.instrument_status[0].time_stamp);

    // Create blank instrument array
    let newDate = new Date();
    let isoDate = newDate.toISOString();
    this.instrument = {
      time_zone: "UTC",
      time_stamp: isoDate,
    }
    this.getSensorTypes();
    this.getSensorBrands();
    this.getHousingTypes();
    this.getDeploymentTypes();
    this.getVDatums();
    this.collectConditionLookup();
    this.setTimeAndDate();
    this.setDeployMember();
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({
      instrument_status: new FormGroup(this.createInstrumentArray(this.instrument)),
      tapedowns: new FormArray(this.tapedowns.map((tapedown) => new FormGroup(this.createTapedownArray(tapedown)))),
      inst_collection_id: new FormControl(null),
      refDatums: new FormControl(),

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
      site_id: new FormControl(this.sensor.site_id !== undefined && this.sensor.site_id !== "" ? this.sensor.site_id : null),
    })

    if(this.instrument.timezone !== 'UTC'){
      this.previewUTC();
    }
  }

  previewUTC() {
    let self = this;
    console.log(this.form.controls["instrument_status"].controls)
    console.log(this.form.controls["instrument_status"].controls.value)
    let hour = this.form.controls["instrument_status"].controls.ampm.value === "PM" ? (Number(this.form.controls["instrument_status"].controls.hour.value) + 12) : this.form.controls["instrument_status"].controls.hour.value;
    if(String(hour) === '12' && this.form.controls["instrument_status"].controls.ampm.value === 'AM'){
      hour = '00';
    }else if (String(hour) === '24' && this.form.controls["instrument_status"].controls.ampm.value === 'PM'){
      hour = '12';
    }else{
      hour = String(hour).padStart(2, '0');
    }
    let minute = String(this.form.controls["instrument_status"].controls.minute.value).padStart(2, '0');
    let initDate;
    try{
      initDate = this.form.controls["instrument_status"].controls.time_stamp.value.split('T')[0];
    }
    catch{
      // If date changed using Datepicker, format will need to be changed
      initDate = DateTime.fromJSDate(this.form.controls["instrument_status"].controls.time_stamp.value).toString();
      initDate = initDate.split('T')[0];
    }
    let date = initDate + "T" + hour + ":" + minute + ":00";
    // Convert to UTC
    let utcDate;
    utcDate = self.timezonesService.convertTimezone(this.instrument.time_zone, date, minute);
    let utchour = (utcDate.split('T')[1]).split(':')[0].padStart(2, '0');
    self.form.controls["instrument_status"].controls["time_stamp"].setValue(date);
    self.form.controls["instrument_status"].controls["minute"].setValue(minute);
    let timestamp = utcDate.split("T")[0];
    timestamp = timestamp.split("-");
    timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + utchour + ":" + minute;
    this.instrument.utc_preview = timestamp.replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '/');
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

  isValidHour() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = control.value < new Date(this.sensor.instrument_status[0].time_stamp).getHours();
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  isValidMinute() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = control.value < new Date(this.sensor.instrument_status[0].time_stamp).getMinutes();
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  createInstrumentArray(instrument) {
    let timezone = this.timezonesService.matchTimezone(instrument.time_zone);
    return {
      instrument_id: new FormControl(this.sensor.instrument_id ? this.sensor.instrument_id: null),
      instrument_status_id: new FormControl(this.instrument.instrument_status_id ? this.instrument.instrument_status_id: null),
      time_stamp: new FormControl(this.instrument.time_stamp ? this.instrument.time_stamp: null),
      time_zone: new FormControl(timezone ? timezone : null),
      notes: new FormControl(this.instrument.notes ? this.instrument.notes: null),
      member_id: new FormControl(this.retrieveMemberID ? this.retrieveMemberID : null),
      vdatum_id: new FormControl(this.instrument.vdatum_id ? this.instrument.vdatum_id : null),
      vdatum: new FormControl(this.instrument.vdatum ? this.instrument.vdatum : null),
      sensor_elevation: new FormControl(this.instrument.sensor_elevation ? this.instrument.sensor_elevation : null, [this.isNum()]),
      ws_elevation: new FormControl(this.instrument.ws_elevation ? this.instrument.ws_elevation : null, [this.isNum()]),
      gs_elevation: new FormControl(this.instrument.gs_elevation ? this.instrument.gs_elevation : null, [this.isNum()]),
      status_type_id: new FormControl(this.instrument.status_type_id ? this.instrument.status_type_id : null),
      hour: new FormControl(this.instrument.hour ? this.instrument.hour : null),
      minute: new FormControl(this.instrument.minute ? this.instrument.minute : null),
      ampm: new FormControl(this.instrument.ampm ? this.instrument.ampm : null),
    };
  }

  createTapedownArray(tapedown) {
    // Tapedowns initially blank
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

  collectConditionLookup() {
    this.sensorEditService.getCollectConditions()
    .subscribe((results) => {
      this.collectConds = results;
    })
  }

  setDeployMember() {
    let self = this;

    this.sensor.instrument_status.forEach(function(instrument){
      self.siteService
      .getMemberName(instrument.member_id)
      .subscribe((results) => {
        if(results.length > 0 || results.length === undefined){
          self.deployMember.push({name: results.fname + " " + results.lname, status: instrument.status});
        }
      })
    })
  }

  setTimeAndDate() {
      // hour
      let hour = (this.instrument.time_stamp.split('T')[1]).split(':')[0];
      if(hour > 12){
        this.instrument.hour = String(hour - 12).padStart(2, '0');
        this.instrument.ampm = "PM";
      }else{
        if(String(hour) === '00'){
          this.instrument.hour = '12';
          this.instrument.ampm = "AM";
        }else{
          this.instrument.hour = String(hour).padStart(2, '0');
          this.instrument.ampm = "AM";
        }
      }
      // minute
      let minute = this.instrument.time_stamp.split('T')[1].split(':')[1];
      this.instrument.minute = String(minute).padStart(2, '0');
      let timestamp = this.instrument.time_stamp.split("T")[0];
      timestamp = timestamp.split("-");
      timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + hour + ":" + this.instrument.minute;
      this.instrument.utc_preview = timestamp.replace(/T/, ' ').replace(/\..+/, '');
  }

  changeTime() {
    let self = this;
    let newValue = this.instrument.ampm === "PM" ? "AM" : "PM";
    self.form.controls["instrument_status"].controls["ampm"].setValue(newValue);
    this.instrument.ampm = newValue;
    console.log(self.form.controls["instrument_status"].controls["ampm"].value)
    this.previewUTC();
  }

  changeHour() {

  }

  changeMinute() {

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

    let addTapedown = function(statusArray, status, table) {
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
            for(let statusType of self.allStatusTypes){
              if(self.form.controls["instrument_status"].controls.status_type_id.value === statusType.status_type_id){
                statusType.status_type_id;
                if(statusType.status === status){
                  self.form.controls["instrument_status"].controls["vdatum_id"].setValue(mark.vdatum_id);
                  newObject.instrument_status_id = self.form.controls["instrument_status"].controls["instrument_status_id"].value;
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
                  for(let statusType of self.allStatusTypes){
                    if(self.form.controls["instrument_status"].controls.status_type_id.value === statusType.status_type_id){
                      if(statusType.status === status){
                        self.form.controls["instrument_status"].controls["vdatum_id"].setValue(mark.vdatum_id);
                        newObject.instrument_status_id = self.form.controls["instrument_status"].controls["instrument_status_id"].value;
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
      self.form.controls["tapedowns"] = new FormArray(statusArray.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
    }

      // Add tapedown
      if(value.length > this.tapedowns.length){
        addTapedown(this.tapedowns, status, this.retrievedTable);
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
            index = this.tapedowns.findIndex(j => !value.join(',').includes(j.op_name));
            this.tapedowns.splice(index, 1);
            this.tapedowns = [...this.tapedowns];
            self.form.controls["tapedowns"] = new FormArray(this.tapedowns.map((tapedown) => new FormGroup(self.createTapedownArray(tapedown))));
              for(let statusType of self.allStatusTypes){
                if(self.form.controls["instrument_status"].controls.status_type_id.value === statusType.status_type_id){
                  if(statusType.status === "Retrieved"){
                    self.form.controls["instrument_status"].controls["vdatum_id"].setValue(null);
                    self.form.controls["instrument_status"].controls["sensor_elevation"].setValue(null);
                    self.form.controls["instrument_status"].controls["ws_elevation"].setValue(null);
                    self.form.controls["instrument_status"].controls["gs_elevation"].setValue(null);
                  }
                }
              }
          }
        });
      }
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.loading = true;
      this.sendRequests();
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

  async sendRequests() {
    let self = this;

    // Copy form value object and delete extra fields, include disabled form values in submission
    let sensorSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    let sensorStatusSubmission = JSON.parse(JSON.stringify(this.form.controls.instrument_status.getRawValue()));

    let tapedowns = sensorSubmission.tapedowns;

    tapedowns.forEach((i) => delete i.elevation);

    // Put instrument
    delete sensorSubmission.refDatums; delete sensorSubmission.tapedowns;
    delete sensorSubmission.instrument_status;

    console.log(sensorSubmission)
    console.log(tapedowns)

    // const updateInstrument = new Promise<string>((resolve, reject) => this.sensorEditService.putInstrument(sensorSubmission.instrument_id, sensorSubmission).subscribe(results => {
    //   if(results.length !== 0){
    //     this.returnData = results;
    //     this.returnData.sensorType = sensorSubmission.sensor_type_id !== null && sensorSubmission.sensor_type_id !== 0 ? this.sensorTypes.filter(function (i) { return i.sensor_type_id === sensorSubmission.sensor_type_id; })[0].sensor : "";
    //     this.returnData.deploymentType = sensorSubmission.deployment_type_id !== null && sensorSubmission.deployment_type_id !== 0 ? this.deploymentTypes.filter(function (i) { return i.deployment_type_id === sensorSubmission.deployment_type_id; })[0].method : "";
    //     this.returnData.instCollection = sensorSubmission.inst_collection_id !== null && sensorSubmission.inst_collection_id !== 0 ? this.collectConds.filter(function (i) { return i.id === sensorSubmission.inst_collection_id; })[0].condition : "";
    //     this.returnData.housingType = sensorSubmission.housing_type_id !== null && sensorSubmission.housing_type_id !== 0 ? this.housingTypes.filter(function (i) { return i.housing_type_id === sensorSubmission.housing_type_id; })[0].type_name : "";
    //     this.returnData.sensorBrand = sensorSubmission.sensor_brand_id !== null && sensorSubmission.sensor_brand_id !== 0 ? this.sensorBrands.filter(function (i) { return i.sensor_brand_id === sensorSubmission.sensor_brand_id; })[0].brand_name : "";
    //     // Set status type
    //     this.returnData.statusType = sensorSubmission.instrument_status;
    //     this.returnData.eventName = this.sensor.eventName;

    //     // convert to UTC
    //     sensorStatusSubmission.time_stamp = this.timezonesService.convertTimezone(sensorStatusSubmission.time_zone, sensorStatusSubmission.time_stamp, sensorStatusSubmission.minute)
    //     sensorStatusSubmission.time_zone = "UTC";
    //     delete sensorStatusSubmission.ampm; delete sensorStatusSubmission.hour; delete sensorStatusSubmission.minute; delete sensorStatusSubmission.utc_preview; delete sensorStatusSubmission.instrument_status_id;
    //     console.log(sensorStatusSubmission)
    //     this.returnData.instrument_status = this.sensor.instrument_status;
    //     this.sensorEditService.postInstrumentStatus(sensorStatusSubmission).subscribe(results => {
    //       if(results.length !== 0){
    //         for(let statusType of self.allStatusTypes){
    //           if(statusType.status_type_id === results.status_type_id) {
    //             results.status = statusType.status;
    //           }
    //         }
    //         this.sensor.instrument_status.forEach(function(inst_status, i){
    //           if(inst_status.instrument_status_id === results.instrument_status_id){
    //             self.returnData.instrument_status[i] = results;
    //           }
    //         })
    //         this.sendTapedownRequests(tapedowns);

    //         resolve("Success");
    //       }else{
    //         this.dialog.open(ConfirmComponent, {
    //           data: {
    //             title: "Error saving Instrument Status.",
    //             titleIcon: "close",
    //             message: null,
    //             confirmButtonText: "OK",
    //             showCancelButton: false,
    //           },
    //         });
    //         resolve("Success");
    //       }
    //     })
    //   }
    //   else{
    //     this.dialog.open(ConfirmComponent, {
    //       data: {
    //         title: "Error updating Sensor.",
    //         titleIcon: "close",
    //         message: null,
    //         confirmButtonText: "OK",
    //         showCancelButton: false,
    //       },
    //     });
    //     reject(new Error("Error updating Sensor."));
    //   }
    // }));

    // updateInstrument.then(() => {
    //   this.loading = false;
    //   this.dialogRef.close(this.returnData);
    //   this.dialog.open(ConfirmComponent, {
    //     data: {
    //       title: "Successfully updated Sensor",
    //       titleIcon: "check",
    //       message: null,
    //       confirmButtonText: "OK",
    //       showCancelButton: false,
    //     },
    //   });
    // }).catch(function(error) {
    //   console.log(error.message);
    //   self.loading = false;
    // });

  }

  // Need to populate edit form with new tapedown info, but don't need to return them to site details component
  sendTapedownRequests(tapedownsToAdd) {
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
  }

}
