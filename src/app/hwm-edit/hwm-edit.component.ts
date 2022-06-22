import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { FileEditComponent } from '@app/file-edit/file-edit.component';
import { EventService } from '@app/services/event.service';
import { HwmEditService } from '@app/services/hwm-edit.service';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-hwm-edit',
  templateUrl: './hwm-edit.component.html',
  styleUrls: ['./hwm-edit.component.scss']
})
export class HwmEditComponent implements OnInit {

  public form;
  public hwm;
  public events;
  public vdatums;
  public vmethods;
  public hdatums;
  public hmethods;
  public hwmTypes;
  public hwmMarkers;
  public hwmQualities;
  public surveyMember;
  public flagMember;
  public approvalDate;
  public approvalMember;
  public approved = false;
  public initHWMFiles = [];
  public hwm_environment;
  public hwmBank;
  public isStillwater;
  public uncertainty_unit = "ft";
  public latLngUnit = "decdeg";
  public incorrectDMS = false;
  public role = Number(localStorage.role);
  public dms = {
    latdeg: null,
    latmin: null,
    latsec: null,
    londeg: null,
    lonmin: null,
    lonsec: null,
  }
  public returnData;
  public returnFiles = [];

  displayedFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  infoExpanded = true;
  filesExpanded = false;
  loading = false;
  editOrCreate;
  eventName;

  constructor(
    private dialogRef: MatDialogRef<HwmEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
    public eventService: EventService,
    public hwmEditService: HwmEditService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.hwm = this.data.hwm;
    this.hmethods = this.data.hmethodList;
    this.hdatums = this.data.hdatumList;
    
    this.getVDatums();
    this.getVMethods();
    this.getHWMTypes();
    this.getHWMMarkers();
    this.getHWMQualities();

    // Edit hwm
    if(this.hwm !== null){
      this.editOrCreate = "Edit";

      // Admins can change event
      if(this.role === 1){
        this.getEventList();
      }

      this.getInitFiles();
      if(this.hwm.approval_id){
        this.getApproval();
        this.approved = true;
      }else{
        this.approved = false;
      }
      this.initForm();
    }else{
      // Add hwm
      this.editOrCreate = "Create";
      // Default values for new HWM
      this.hwm = {
        site_id: this.data.site_id,
        event_id: this.data.event_id,
        hwm_environment: 'Riverine',
        bank: 'N/A',
        hwm_label: 'no_label',
        stillwater: 0,
        latitude_dd: this.data.hwmSite.latitude_dd,
        longitude_dd: this.data.hwmSite.longitude_dd,
        waterbody: this.data.hwmSite.waterbody,
        hdatum_id: this.data.hwmSite.hdatum_id,
        hcollect_method_id: this.data.hwmSite.hcollect_method_id,
        flag_date: this.makeAdate(""),
        flag_member_id: JSON.parse(localStorage.getItem('currentUser')).member_id
      }
      // Populate event with session event
      this.eventName = this.data.event;
      this.initForm();
    }
    
    this.setMembers();
    this.hwm_environment = this.hwm.hwm_environment;
    this.hwmBank = this.hwm.bank;
    if(this.hwm.stillwater === 1){
      this.isStillwater = "Yes";
    }else{
      this.isStillwater = "No";
    }
  }

  getEventList() {
    this.eventService.getAllEvents().subscribe(results => {
      this.events = results;
    })
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

  getHWMTypes() {
    this.hwmEditService.getHWMTypeLookup()
      .subscribe((results) => {
        this.hwmTypes = results;
      })
  }

  getHWMMarkers() {
    this.hwmEditService.getHWMMarkerLookup()
      .subscribe((results) => {
        this.hwmMarkers = results;
      })
  }

  getHWMQualities() {
    this.hwmEditService.getHWMQualityLookup()
      .subscribe((results) => {
        this.hwmQualities = results;
      })
  }

  getApproval() {
    this.hwmEditService.getApproval(this.hwm.approval_id)
      .subscribe((results) => {
        this.approvalDate = new Date(results.approval_date);
        if(results.member_id !== undefined){
          // Approval member
          this.siteService
          .getMemberName(results.member_id)
          .subscribe((results) => {
            if(results.length > 0 || results.length === undefined){
              this.approvalMember =  results.fname + " " + results.lname;
            }
          })
        }
      })
  }

  setMembers() {
    // Survey member
    if(this.hwm.survey_member_id){
      this.siteService
      .getMemberName(this.hwm.survey_member_id)
      .subscribe((results) => {
        if(results.length > 0 || results.length === undefined){
          this.surveyMember =  results.fname + " " + results.lname;
        }
      })
    }

    // Flagging member
    this.siteService
    .getMemberName(this.hwm.flag_member_id)
    .subscribe((results) => {
      if(results.length > 0 || results.length === undefined){
        this.flagMember =  results.fname + " " + results.lname;
      }
    })
  }

  getInitFiles() {
    let self = this;
    this.data.files.forEach(function(file){
      if(file.hwm_id === self.hwm.hwm_id){
        self.initHWMFiles.push(file);
      }
    })
  }

  initForm() {
    this.form = new FormGroup({
      waterbody: new FormControl(this.hwm.waterbody !== undefined && this.hwm.waterbody !== "" ? this.hwm.waterbody : null),
      hwm_type_id: new FormControl(this.hwm.hwm_type_id !== undefined && this.hwm.hwm_type_id !== "" ? this.hwm.hwm_type_id : null, Validators.required),
      marker_id: new FormControl(this.hwm.marker_id !== undefined && this.hwm.marker_id !== "" ? this.hwm.marker_id : null),
      latitude_dd: new FormControl(this.hwm.latitude_dd !== undefined && this.hwm.latitude_dd !== "" ? this.hwm.latitude_dd : null),
      longitude_dd: new FormControl(this.hwm.longitude_dd !== undefined && this.hwm.longitude_dd !== "" ? this.hwm.longitude_dd : null),
      latdeg: new FormControl(this.dms.latdeg),
      latmin: new FormControl(this.dms.latmin),
      latsec: new FormControl(this.dms.latsec),
      londeg: new FormControl(this.dms.londeg),
      lonmin: new FormControl(this.dms.lonmin),
      lonsec: new FormControl(this.dms.lonsec),
      hwm_quality_id: new FormControl(this.hwm.hwm_quality_id !== undefined && this.hwm.hwm_quality_id !== "" ? this.hwm.hwm_quality_id : null, Validators.required),
      bank: new FormControl(this.hwm.bank !== undefined && this.hwm.bank !== "" ? this.hwm.bank : null),
      elev_ft: new FormControl(this.hwm.elev_ft !== undefined && this.hwm.elev_ft !== "" ? this.hwm.elev_ft : null, [this.isNum()]),
      hwm_locationdescription: new FormControl(this.hwm.hwm_locationdescription !== undefined && this.hwm.hwm_locationdescription !== "" ? this.hwm.hwm_locationdescription : null),
      hwm_environment: new FormControl(this.hwm.hwm_environment !== undefined && this.hwm.hwm_environment !== "" ? this.hwm.hwm_environment : null, Validators.required),
      hdatum_id: new FormControl(this.hwm.hdatum_id !== undefined && this.hwm.hdatum_id !== "" ? this.hwm.hdatum_id : null, Validators.required),
      hcollect_method_id: new FormControl(this.hwm.hcollect_method_id !== undefined && this.hwm.hcollect_method_id !== "" ? this.hwm.hcollect_method_id : null, Validators.required),
      height_above_gnd: new FormControl(this.hwm.height_above_gnd !== undefined && this.hwm.height_above_gnd !== "" ? this.hwm.height_above_gnd : null, [this.isNum()]),
      stillwater: new FormControl(this.hwm.stillwater !== undefined && this.hwm.stillwater !== "" ? this.hwm.stillwater : null),
      flag_date: new FormControl(this.hwm.flag_date !== undefined && this.hwm.flag_date !== "" ? this.hwm.flag_date : null, Validators.required),
      survey_date: new FormControl(this.hwm.survey_date !== undefined && this.hwm.survey_date !== "" ? this.hwm.survey_date : null),
      site_id: new FormControl(this.data.site_id !== undefined && this.data.site_id !== "" ? this.data.site_id : null),
      vdatum_id: new FormControl(this.hwm.vdatum_id !== undefined && this.hwm.vdatum_id !== "" ? this.hwm.vdatum_id : null),
      vcollect_method_id: new FormControl(this.hwm.vcollect_method_id !== undefined && this.hwm.vcollect_method_id !== "" ? this.hwm.vcollect_method_id : null),
      hwm_uncertainty: new FormControl(this.hwm.hwm_uncertainty !== undefined && this.hwm.hwm_uncertainty !== "" ? this.hwm.hwm_uncertainty : null, [this.isNum()]),
      uncertainty: new FormControl(this.hwm.uncertainty !== undefined && this.hwm.uncertainty !== "" ? this.hwm.uncertainty : null, [this.isNum()]),
      hwm_id: new FormControl(this.hwm.hwm_id !== undefined && this.hwm.hwm_id !== "" ? this.hwm.hwm_id : null),
      hwm_label: new FormControl(this.hwm.hwm_label !== undefined && this.hwm.hwm_label !== "" ? this.hwm.hwm_label : null, Validators.required),
      hwm_notes: new FormControl(this.hwm.hwm_notes !== undefined && this.hwm.hwm_notes !== "" ? this.hwm.hwm_notes : null),
      survey_member_id: new FormControl(this.hwm.survey_member_id !== undefined && this.hwm.survey_member_id !== "" ? this.hwm.survey_member_id : null),
      flag_member_id: new FormControl(this.hwm.flag_member_id !== undefined && this.hwm.flag_member_id !== "" ? this.hwm.flag_member_id : null),
      peak_summary_id: new FormControl(this.hwm.peak_summary_id !== undefined && this.hwm.peak_summary_id !== "" ? this.hwm.peak_summary_id : null),
      approval_id: new FormControl(this.hwm.approval_id !== undefined && this.hwm.approval_id !== "" ? this.hwm.approval_id : null),
      event_id: new FormControl(this.hwm.event_id !== undefined && this.hwm.event_id !== "" ? this.hwm.event_id : null),
    })

    this.setLatLngValidators();
  }

  changeHWMEnvironment(value) {
    if(value === "Coastal"){
      this.hwm_environment = "Coastal";
      this.form.controls.hwm_environment.setValue(this.hwm_environment);
    }else if (value === "Riverine") {
      this.hwm_environment = "Riverine";
      this.form.controls.hwm_environment.setValue(this.hwm_environment);
    }
  }

  changeBank(value) {
    if(value === "Left"){
      this.hwmBank = "Left";
      this.form.controls.bank.setValue(this.hwmBank);
    }else if (value === "Right") {
      this.hwmBank = "Right";
      this.form.controls.bank.setValue(this.hwmBank);
    }else if (value === "N/A") {
      this.hwmBank = "N/A";
      this.form.controls.bank.setValue(this.hwmBank);
    }
  }

  changeStillwater(value) {
    if(value === "Yes"){
      this.isStillwater = "Yes";
      this.form.controls.stillwater.setValue(1);
    }else if (value === "No") {
      this.isStillwater = "No";
      this.form.controls.stillwater.setValue(0);
    }
  }

  uncertaintyUnitChange(value) {
    if(value === "ft"){
      this.uncertainty_unit = "ft";
    }else if (value === "cm") {
      this.uncertainty_unit = "cm";
    }
  }

  //hwm_uncertainty typed in, choose cooresponding hwm_environment
  chooseQuality() {
    let uncertainty = this.form.get("hwm_uncertainty").value;
    if (uncertainty !== "") {
        var x = Number(uncertainty);
        //  Excellent    +-0.05       0      -  0.050
        //  Good         +-0.10       0.051  -  0.100
        //  Fair         +-0.20       0.101  -  0.200
        //  Poor         +-0.40       0.201  -  0.400
        //  V Poor       > 0.40       0.401  -  infinity
        if(x <= 1){
          this.form.get("hwm_quality_id").setValue(this.hwmQualities.filter(function (h) { return h.min_range <= x && h.max_range >= x; })[0].hwm_quality_id);
        }else{
          // Very poor, max range is infinity
          this.form.get("hwm_quality_id").setValue(this.hwmQualities.filter(function (h) { return h.hwm_quality_id === 5})[0].hwm_quality_id);
        }
    }
  }

  //hwm quality chosen (or it changed from above), check to make sure it is congruent with input above
  compareToUncertainty() {
    let uncertainty = this.form.get("hwm_uncertainty").value;
    let qualityId = this.form.get("hwm_quality_id").value;
    if (uncertainty !== "" && uncertainty !== undefined) {
        var x = Number(uncertainty);
        if(uncertainty <= 1){
          var matchingQualId = this.hwmQualities.filter(function (h) { return h.min_range <= x && h.max_range >= x; })[0].hwm_quality_id;
        }else{
          // Very poor, max range is infinity
          var matchingQualId = this.hwmQualities.filter(function (h) { return h.hwm_quality_id === 5 })[0].hwm_quality_id;
        }
        if (qualityId !== matchingQualId) {
            //show warning modal and focus in uncertainty
            this.dialog.open(ConfirmComponent, {
              data: {
                title: "",
                titleIcon: "close",
                message: "There is a mismatch between the hwm quality chosen and the hwm uncertainty above. Please correct your hwm uncertainty.",
                confirmButtonText: "OK",
                showCancelButton: false,
              },
            });
        }
    }
  }

  // Lat/lon
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
            this.form.get('latitude_dd').setValue(this.azimuth(this.form.controls.latdeg.value, this.form.controls.latmin.value, this.form.controls.latsec.value));
            this.form.get('longitude_dd').setValue(this.azimuth(this.form.controls.londeg.value, this.form.controls.lonmin.value, this.form.controls.lonsec.value));
            this.incorrectDMS = false;
        } else {
            this.incorrectDMS = true;
        }
    } else {
        this.latLngUnit = "dms"
        //they clicked dms (convert lat/long to dms)
        if (this.form.controls.latitude_dd.value !== undefined && this.form.controls.longitude_dd.value !== undefined) {
            var latDMS = (this.deg_to_dms(this.form.controls.latitude_dd.value)).toString();
            var ladDMSarray = latDMS.split(':');
            this.form.get('latdeg').setValue(ladDMSarray[0]);
            this.form.get('latmin').setValue(ladDMSarray[1]);
            this.form.get('latsec').setValue(ladDMSarray[2]);

            var longDMS = this.deg_to_dms(this.form.controls.longitude_dd.value);
            var longDMSarray = longDMS.split(':');
            this.form.get('londeg').setValue((-(longDMSarray[0])).toString());
            this.form.get('lonmin').setValue(longDMSarray[1]);
            this.form.get('lonsec').setValue(longDMSarray[2]);
        }
    }
  }

  // Create a date without time
  makeAdate(d) {
    var aDate = new Date();
    if (d !== "" && d !== undefined) {
        //provided date
        aDate = new Date(d);
    }
    var year = aDate.getFullYear();
    var month = aDate.getMonth();
    var day = ('0' + aDate.getDate()).slice(-2);
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dateWOtime = new Date(monthNames[month] + " " + day + ", " + year);
    return dateWOtime;
  };

  /* istanbul ignore next */
  openAddFileDialog() {
    let self = this;
    // Open File Edit Dialog
    const dialogRef = this.dialog.open(FileEditComponent, {
      data: {
          row_data: null,
          type: 'HWM File',
          siteInfo: this.data.hwmSite,
          siteRefDatums: this.data.siteRefDatums,
          siteHWMs: this.data.siteHWMs,
          siteSensors: this.data.siteSensors,
          addOrEdit: 'Add'
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        // Update files data source and hwm
        self.initHWMFiles.push(result);
        self.initHWMFiles = [...self.initHWMFiles];
        self.returnFiles.push(result);
      }
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.loading = true;

      // Convert to decimal degrees
      if(this.latLngUnit === "dms"){
        this.form.get('latitude_dd').setValue(this.azimuth(this.form.controls.latdeg.value, this.form.controls.latmin.value, this.form.controls.latsec.value));
        this.form.get('longitude_dd').setValue(this.azimuth(this.form.controls.londeg.value, this.form.controls.lonmin.value, this.form.controls.lonsec.value));
      }

      // If uncertainty is in cm, convert to ft
      if(this.uncertainty_unit === "cm"){
        this.form.get("uncertainty").setValue((parseFloat(this.form.controls.uncertainty.value) / 30.48).toFixed(6));
      }

      //if they added a survey date, apply survey member as logged in member
      if (this.form.get("survey_date").value !== undefined && this.form.get("survey_member_id").value === undefined){
        this.form.get("survey_member_id").setValue(JSON.parse(localStorage.getItem('currentUser')).member_id);
      }

      if (this.form.get("elev_ft").value !== undefined && this.form.get("elev_ft").value !== null) {
        //make sure they added the survey date if they added an elevation
        if (this.form.get("survey_date").value === undefined || this.form.get("survey_date").value === null){
          this.form.get("survey_date").setValue(this.makeAdate(""));
        }

        if (this.form.get("survey_member_id").value === undefined || this.form.get("survey_member_id").value === null){
          this.form.get("survey_member_id").setValue(JSON.parse(localStorage.getItem('currentUser')).member_id);
        }
    }

      this.sendRequests();
    }else{
      this.loading = false;
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "",
          titleIcon: "close",
          message: "Some required HWM fields are missing or incorrect.  Please fix these fields before submitting.",
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
    }
  }

  sendRequests() {
    let self = this;
    // Copy form value object and delete extra fields
    let hwmSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    delete hwmSubmission.latdeg; delete hwmSubmission.latmin; delete hwmSubmission.latsec; delete hwmSubmission.londeg; delete hwmSubmission.lonmin; delete hwmSubmission.lonsec;

    if(this.editOrCreate === "Edit"){
      const updateHWM = new Promise<string>((resolve, reject) => this.hwmEditService.putHWM(hwmSubmission.hwm_id, hwmSubmission).subscribe(results => {
        if(results.length !== 0){
          this.returnData = results;
          // Add formatted date
          let flagDate = this.returnData.flag_date.split("T")[0];
          flagDate = flagDate.split("-");
          flagDate = flagDate[1] + "/" + flagDate[2] + "/" + flagDate[0];
          this.returnData.format_flag_date = flagDate;
          resolve("Success");
        }else{
          // Error
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error updating HWM",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
          reject(new Error("Error updating HWM."));
        }
      }));

      updateHWM.then(() => {
        this.loading = false;
        let result = {result: this.returnData, editOrCreate: this.editOrCreate, returnFiles: this.returnFiles}
        this.dialogRef.close(result);
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully updated HWM",
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
      delete hwmSubmission.hwm_id;
      const createHWM = new Promise<string>((resolve, reject) => this.hwmEditService.postHWM(hwmSubmission).subscribe(results => {
        if(results.length !== 0){
          this.returnData = results;
          // Add formatted date
          let flagDate = this.returnData.flag_date.split("T")[0];
          flagDate = flagDate.split("-");
          flagDate = flagDate[1] + "/" + flagDate[2] + "/" + flagDate[0];
          this.returnData.format_flag_date = flagDate;
          resolve("Success");
        }else{
          // Error
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "Error creating HWM",
              titleIcon: "close",
              message: null,
              confirmButtonText: "OK",
              showCancelButton: false,
            },
          });
          reject(new Error("Error creating HWM."));
        }
      }));

      createHWM.then(() => {
        this.loading = false;
        let result = {result: this.returnData, editOrCreate: this.editOrCreate, returnFiles: this.returnFiles}
        this.dialogRef.close(result);
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully created HWM",
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

}
