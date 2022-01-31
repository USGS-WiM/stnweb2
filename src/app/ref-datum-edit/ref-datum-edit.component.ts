import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { OpEditService } from '@app/services/op-edit.service';
import { ConfirmComponent } from '@app/confirm/confirm.component';

@Component({
  selector: 'app-ref-datum-edit',
  templateUrl: './ref-datum-edit.component.html',
  styleUrls: ['./ref-datum-edit.component.scss']
})
export class RefDatumEditComponent implements OnInit {
  public form;
  public rd;
  public hmethods;
  public hdatums;
  public vmethods;
  public vdatums;
  public opQualities;
  public types;
  public formattedEstDate;
  public formattedRecDate;
  public unquantified = false;
  public elev_unit = "ft";
  public uncertainty_unit = "ft";
  public controlObj = {op_control_identifier_id: null, objective_point_id: null, identifier: null, identifier_type: null, last_updated: null, last_updated_by: null};
  public controlID = [];
  public controlsToAdd = [];
  public controlsToRemove = [];
  public latLngUnit = "decdeg";
  public incorrectDMS = false;
  public dms = {
    latdeg: null,
    latmin: null,
    latsec: null,
    londeg: null,
    lonmin: null,
    lonsec: null,
  }
  public initDatumFiles = [];
  public loading = false;
  public returnData = {
    referenceDatums: null,
    opControlID: [],
  };

  displayedFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  infoExpanded = true;
  filesExpanded = false;

  constructor(
    private dialogRef: MatDialogRef<RefDatumEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
    public opEditService: OpEditService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.rd = this.data.rd;
    this.hmethods = this.data.hmethodList;
    this.hdatums = this.data.hdatumList;

    if(this.rd.unquantified === "1"){
      this.unquantified = true;
    }
    
    this.getInitFiles();
    this.getOPQuality();
    this.getOPTypes();
    this.getVDatums();
    this.getVMethods();
    this.getControlID();
    this.initForm();
  }

  getVDatums() {
    this.siteService
    .getVDatumLookup()
    .subscribe((results) => {
      this.vdatums = results;
    });
  }

  getVMethods() {
    this.siteService
    .getVMethodLookup()
    .subscribe((results) => {
      this.vmethods = results;
    });
  }

  getOPQuality() {
    let self = this;

    this.siteService
    .getOPQualityLookup()
    .subscribe((results) => {
      this.opQualities = results;
    });
  }

  getOPTypes() {
    this.siteService
    .getOPTypeLookup()
    .subscribe((results) => {
      this.types = results;
    });
  }

  getControlID() {
    let self = this;

    this.siteService
    .getOPControlID(this.rd.objective_point_id)
    .subscribe((results) => {
      console.log(results)
      if(results.length > 0){
        results.forEach(function(control){
          self.controlID.push(control);
          self.controlsToAdd.push(control);
        });
        this.form.controls["op_control_identifier"] = new FormArray(this.controlsToAdd.map((control) => new FormGroup(this.createControlArray(control))));
      }
    });
  }

  getInitFiles() {
    let self = this;
    this.data.files.forEach(function(file){
      if(file.objective_point_id === self.rd.objective_point_id){
        self.initDatumFiles.push(file);
      }
    })
  }
  
  initForm() {
    this.form = new FormGroup({
      op_type_id: new FormControl(this.rd.op_type_id !== undefined && this.rd.op_type_id !== "" ? this.rd.op_type_id : null, Validators.required),
      name: new FormControl(this.rd.name !== undefined && this.rd.name !== "" ? this.rd.name : null, Validators.required),
      description: new FormControl(this.rd.description !== undefined && this.rd.description !== "" ? this.rd.description : null, Validators.required),
      op_control_identifier: new FormArray(this.controlsToAdd.map((control) => new FormGroup(this.createControlArray(control)))),
      op_is_destroyed: new FormControl(this.rd.op_is_destroyed !== undefined && this.rd.op_is_destroyed !== "" ? this.rd.op_is_destroyed : null),
      latitude_dd: new FormControl(this.rd.latitude_dd !== undefined && this.rd.latitude_dd !== "" ? this.rd.latitude_dd : null),
      longitude_dd: new FormControl(this.rd.longitude_dd !== undefined && this.rd.longitude_dd !== "" ? this.rd.longitude_dd : null),
      objective_point_id: new FormControl(this.rd.objective_point_id),
      latdeg: new FormControl(this.dms.latdeg),
      latmin: new FormControl(this.dms.latmin),
      latsec: new FormControl(this.dms.latsec),
      londeg: new FormControl(this.dms.londeg),
      lonmin: new FormControl(this.dms.lonmin),
      lonsec: new FormControl(this.dms.lonsec),
      hdatum_id: new FormControl(this.rd.hdatum_id !== undefined && this.rd.hdatum_id !== "" ? this.rd.hdatum_id : null),
      hcollect_method_id: new FormControl(this.rd.hcollect_method_id !== undefined && this.rd.hcollect_method_id !== "" ? this.rd.hcollect_method_id : null),
      elev_ft: new FormControl(this.rd.elev_ft !== undefined && this.rd.elev_ft !== "" ? this.rd.elev_ft : null),
      vdatum_id: new FormControl(this.rd.vdatum_id !== undefined && this.rd.vdatum_id !== "" ? this.rd.vdatum_id : null, Validators.required),
      vcollect_method_id: new FormControl(this.rd.vcollect_method_id !== undefined && this.rd.vcollect_method_id !== "" ? this.rd.vcollect_method_id : null),
      uncertainty: new FormControl({value: this.rd.uncertainty !== undefined ? this.rd.uncertainty : null, disabled: this.unquantified}),
      unquantified: new FormControl(this.rd.unquantified),
      op_quality_id: new FormControl(this.rd.op_quality_id !== undefined && this.rd.op_quality_id !== "" ? this.rd.op_quality_id : null),
      op_notes: new FormControl(this.rd.op_notes !== undefined && this.rd.op_notes !== "" ? this.rd.op_notes : null),
      date_established: new FormControl(this.rd.date_established !== undefined && this.rd.date_established !== "" ? this.rd.date_established : null, Validators.required),
      date_recovered: new FormControl(this.rd.date_recovered !== undefined && this.rd.date_recovered !== "" ? this.rd.date_recovered : null),
      site_id: new FormControl(this.data.site_id !== undefined && this.data.site_id !== "" ? this.data.site_id : null)
    })

    this.form.controls.uncertainty.setValidators([this.isNum()]);
    this.form.controls.elev_ft.setValidators([this.isNum()]);
  }

  createControlArray(control) {
    return {
      objective_point_id: new FormControl(control.objective_point_id ? control.objective_point_id: null),
      identifier: new FormControl(control.identifier ? control.identifier : null),
      identifier_type: new FormControl(control.identifier_type ? control.identifier_type : null),
      op_control_identifier_id: new FormControl(control.op_control_identifier_id ? control.op_control_identifier_id: null),
      last_updated: new FormControl(control.last_updated ? control.last_updated : null),
      last_updated_by: new FormControl(control.last_updated_by ? control.last_updated_by : null),
    } as FormArray["value"];
  }

  unquantifiedChanged(event) {
    this.unquantified = !this.unquantified;
    if(event.checked){
      this.form.controls.uncertainty.setValue(null);
      this.form.controls.unquantified.setValue("1");
      this.form.controls.uncertainty.disable();
    }else{
      this.form.controls.unquantified.setValue(null);
      this.form.controls.uncertainty.enable();
    }
  }

  elevUnitChange(event) {
    if(event.value === "ft"){
      this.elev_unit = "ft"
    }else if (event.value === "m") {
      this.elev_unit = "m"
    }
  }

  uncertaintyUnitChange(event) {
    if(event.value === "ft"){
      this.uncertainty_unit = "ft"
    }else if (event.value === "cm") {
      this.uncertainty_unit = "cm"
    }
  }

  addControl() {
    this.controlsToAdd.push(JSON.parse(JSON.stringify(this.controlObj)));
    this.form.controls["op_control_identifier"] = new FormArray(this.controlsToAdd.map((control) => new FormGroup(this.createControlArray(control))));
  }

  removeControlIdentifier(control, i) {
    if (control.op_control_identifier_id !== undefined) {
        this.controlsToRemove.push(control);
        this.controlsToAdd.splice(i, 1);
    } else {
        this.controlsToAdd.splice(i, 1);
    }
    this.form.controls["op_control_identifier"] = new FormArray(this.controlsToAdd.map((control) => new FormGroup(this.createControlArray(control))));
  }

  changeControlID(event, i, control) {
    this.form.controls["op_control_identifier"].controls[i].controls.identifier_type.setValue(control.identifier_type);
    this.controlsToAdd[i].identifier_type = control.identifier_type;
  }

  addControlToList(i) {
    let self = this;
    this.controlsToAdd = [];
    this.form.controls["op_control_identifier"].controls.forEach(function(control){
      self.controlsToAdd.push({op_control_identifier_id: control.controls.op_control_identifier_id.value, objective_point_id: control.controls.objective_point_id.value, identifier: control.controls.identifier.value, identifier_type: control.controls.identifier_type.value, last_updated: control.controls.last_updated.value, last_updated_by: control.controls.last_updated_by.value});
    });
  }

  setLatLngValidators() {
    if (this.latLngUnit === "dms"){
      this.form.controls.latdeg.setValidators([Validators.required, this.checkDDLatDegValue()]);
      this.form.controls.latmin.setValidators([Validators.required, this.checkDDLatMinValue()]);
      this.form.controls.latsec.setValidators([Validators.required, this.checkDDLatSecValue()]);
      this.form.controls.londeg.setValidators([Validators.required, this.checkDDLonDegValue()]);
      this.form.controls.lonmin.setValidators([Validators.required, this.checkDDLonMinValue()]);
      this.form.controls.lonsec.setValidators([Validators.required, this.checkDDLonSecValue()]);
      this.form.controls.latitude_dd.setValidators();
      this.form.controls.longitude_dd.setValidators();
    }else{
      this.form.controls.latitude_dd.setValidators([Validators.required, this.checkLatValue()]);
      this.form.controls.longitude_dd.setValidators([Validators.required, this.checkLonValue()]);
      this.form.controls.latdeg.setValidators();
      this.form.controls.latmin.setValidators();
      this.form.controls.latsec.setValidators();
      this.form.controls.londeg.setValidators();
      this.form.controls.lonmin.setValidators();
      this.form.controls.lonsec.setValidators();
    }
  }

  range = function (x, min, max) {
    return x < min || x > max;
  }

  checkNaN = function(x){
    return isNaN(x);
  }

  // Validate elevation and uncertainty
  isNum() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value);
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  // Validate lat/lngs
  checkLatValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.range(control.value, 0, 73) || this.checkNaN(control.value);
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  checkLonValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = control.value !== null ? (this.range(control.value, -175, -60) || this.checkNaN(control.value)) : this.checkNaN(control.value);
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  checkDDLonDegValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.range(control.value, -175, -60) || this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  checkDDLonMinValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  checkDDLonSecValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  checkDDLatDegValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.range(control.value, 0, 73) || this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  checkDDLatMinValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  checkDDLatSecValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  //convert deg min sec to dec degrees
  azimuth = function (deg, min, sec) {
    var azi = 0;
    if (deg < 0) {
        azi = -1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
        return (-1.0 * azi).toFixed(5);
    }
    else {
        azi = 1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
        return (azi).toFixed(5);
    }
  }

  //convert dec degrees to dms
  deg_to_dms = function (deg) {
    if (deg < 0) {
        deg = deg.toString();

        //longitude, remove the - sign
        deg = deg.substring(1);
    }
    var d = Math.floor(deg);
    var minfloat = (deg - d) * 60;
    var m = Math.floor(minfloat);
    var s = ((minfloat - m) * 60).toFixed(3);

    return ("" + d + ":" + m + ":" + s);
  }

  changeLatLngUnit(event) {
    this.setLatLngValidators();
    if (event.value == "decdeg") {
        this.latLngUnit = "decdeg";
        //they clicked Dec Deg..
        if ((this.form.controls.latdeg.value !== undefined && this.form.controls.latmin.value !== undefined && this.form.controls.latsec.value !== undefined) &&
            (this.form.controls.londeg.value !== undefined && this.form.controls.lonmin.value !== undefined && this.form.controls.lonsec.value !== undefined)) {
            //convert what's here for each lat and long
            this.form.controls['latitude_dd'].setValue(this.azimuth(this.form.controls.latdeg.value, this.form.controls.latmin.value, this.form.controls.latsec.value));
            this.form.controls['longitude_dd'].setValue(this.azimuth(this.form.controls.londeg.value, this.form.controls.lonmin.value, this.form.controls.lonsec.value));
            this.incorrectDMS = false;
        } else {
            //show card telling them to populate all three (DMS) for conversion to work
            this.incorrectDMS = true;
        }
    } else {
        this.latLngUnit = "dms"
        //they clicked dms (convert lat/long to dms)
        if (this.form.controls.latitude_dd.value !== undefined && this.form.controls.longitude_dd.value !== undefined) {
            var latDMS = (this.deg_to_dms(this.form.controls.latitude_dd.value)).toString();
            var ladDMSarray = latDMS.split(':');
            this.form.controls['latdeg'].setValue(ladDMSarray[0]);
            this.form.controls['latmin'].setValue(ladDMSarray[1]);
            this.form.controls['latsec'].setValue(ladDMSarray[2]);

            var longDMS = this.deg_to_dms(this.form.controls.longitude_dd.value);
            var longDMSarray = longDMS.split(':');
            this.form.controls['londeg'].setValue((-(longDMSarray[0])).toString());
            this.form.controls['lonmin'].setValue(longDMSarray[1]);
            this.form.controls['lonsec'].setValue(longDMSarray[2]);
        }
    }
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.loading = true;

      // Convert to decimal degrees
      if(this.latLngUnit === "dms"){
        this.form.controls['latitude_dd'].setValue(this.azimuth(this.form.controls.latdeg.value, this.form.controls.latmin.value, this.form.controls.latsec.value));
        this.form.controls['longitude_dd'].setValue(this.azimuth(this.form.controls.londeg.value, this.form.controls.lonmin.value, this.form.controls.lonsec.value));
      }

      // If elevation in meters, convert to ft before submitting
      if(this.elev_unit === "m"){
        this.form.controls.elev_ft.setValue(this.form.controls.elev_ft.value * 3.2808);
      }

      // If uncertainty in cm, convert to ft before submitting
      if(this.uncertainty_unit === "cm"){
        this.form.controls.uncertainty.setValue((parseFloat(this.form.controls.uncertainty.value) / 30.48).toFixed(6));
      }

      this.sendRequests();
    }else{
      this.loading = false;
      alert("Some required reference datum fields are missing or incorrect.  Please fix these fields before submitting.")
    }
  }

  async sendRequests() {
    let self = this;
    let promises = [];

    // Copy form value object and delete extra fields, include disabled form values in submission
    let rdSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    delete rdSubmission.latdeg; delete rdSubmission.latmin; delete rdSubmission.latsec; delete rdSubmission.londeg; delete rdSubmission.lonmin; delete rdSubmission.lonsec;
    delete rdSubmission.op_control_identifier;

    // Get list of initial objective points
    let initOPs = [];
    self.controlID.forEach(function(control){
      initOPs.push(control.op_control_identifier_id);
    })
    // Add control identifier array
    if(this.controlsToAdd.length > 0){
      for(let newControl of this.controlsToAdd){
        if((newControl.op_control_identifier_id !== null) && (initOPs.join(',').includes(newControl.op_control_identifier_id.toString()))){
          // Existing control was changed - put
          let changed = false;
          for(let control of self.controlID){
            if(control.op_control_identifier_id === newControl.op_control_identifier_id){
              if(JSON.stringify(control) !== JSON.stringify(newControl)){
                changed = true;
              }
            }
          }
          if(changed){
            const updateOPControl = new Promise<string>(resolve => this.opEditService.updateControlID(newControl.op_control_identifier_id, newControl)
                .subscribe(
                    (data) => {
                        this.returnData.opControlID.push(data);
                        resolve("Update OP control success.");
                    }
                )
              )

            promises.push(updateOPControl);
          }else{
            // Initial id was not changed or removed
            self.returnData.opControlID.push(newControl);
          }
        }else{
          delete newControl.last_updated; delete newControl.last_updated_by; delete newControl.op_control_identifier_id;
          // Add new control - post
          newControl.objective_point_id = rdSubmission.objective_point_id;
          const addOPControl = new Promise<string>(resolve => this.opEditService.postControlID(newControl)
              .subscribe(
                  (data) => {
                      this.returnData.opControlID.push(data);
                      resolve("Add OP control success.");
                  }
              )
            )

          promises.push(addOPControl);
        }
      };
    }

    // Remove control identitier array
    if(this.controlsToRemove.length > 0){
      // Only send new controls
      for(let control of this.controlsToRemove){
        if(control.op_control_identifier_id !== null){
        // delete control
        const deleteOPControl = new Promise<string>(resolve => this.opEditService.deleteControlID(control.op_control_identifier_id)
          .subscribe(
              (data) => {
                  resolve("Delete OP control success.");
              }
          )
        )

        promises.push(deleteOPControl);
        }
      };
    }

    const updateRD = new Promise<string>(resolve => this.opEditService.putReferenceDatum(rdSubmission.objective_point_id, rdSubmission)
      .subscribe(
          (data) => {
              this.returnData.referenceDatums = data;
              resolve("Update reference datum success.");
          }
      )
    )

    promises.push(updateRD)

    Promise.all(promises).then(() => {
      this.dialogRef.close(this.returnData);
      this.loading = false;
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "Successfully updated Reference Datum",
          titleIcon: "check",
          message: null,
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
      return;
    })
  }

}