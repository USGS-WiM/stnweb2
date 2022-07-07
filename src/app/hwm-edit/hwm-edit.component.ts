import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { FileEditComponent } from '@app/file-edit/file-edit.component';
import { FileEditService } from '@app/services/file-edit.service';
import { SiteEditService } from '@app/services/site-edit.service';
import { EventService } from '@app/services/event.service';
import { HwmEditService } from '@app/services/hwm-edit.service';
import { SiteService } from '@app/services/site.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { APP_SETTINGS } from '@app/app.settings';

@Component({
  selector: 'app-hwm-edit',
  templateUrl: './hwm-edit.component.html',
  styleUrls: ['./hwm-edit.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HwmEditComponent implements OnInit {
  @ViewChild('upload', {static: false}) upload: ElementRef;

  public form;
  public hwmFileForm;
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
  private selectedFile = {
    FileEntity: {
      file_id: null,
      name: null,
      FULLname: null,
      source_id: null,
      description: null,
      file_date: null,
      photo_date: null,
      agency_id: null,
      site_id: null,
      filetype_id: null,
      path: null,
      last_updated: null,
      last_updated_by: null,
      site_description: null,
      photo_direction: null,
      latitude_dd: null,
      longitude_dd: null,
      hwm_id: null,
    },
    File: null
  };
  private fileTypes = [];
  private fileType;
  private sourceName;
  private sourceAgency;
  private previewCaption;
  private approvedBy;
  private approvedOn;
  private collectDate;
  private processorName;
  private elevation;
  public fileValid;
  public fileUploading;
  public fileSource;
  public addFileType;
  public fileItemExists = false;
  public agencies = [];
  public agencyNameForCap;

  displayedFileColumns: string[] = [
    'FileName',
    'FileDate',
    'expand',
  ];
  
  expandedElement: any;
  showFileForm = false;
  showFileCreateForm = false;
  showDetails = false;

  infoExpanded = true;
  filesExpanded = false;
  loading = false;
  editOrCreate;
  eventName;

  constructor(
    private dialogRef: MatDialogRef<HwmEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
    public siteEditService: SiteEditService,
    public fileEditService: FileEditService,
    public eventService: EventService,
    public hwmEditService: HwmEditService,
    public dialog: MatDialog,
    private changeDetector : ChangeDetectorRef,
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

      this.getFileTypes();
      this.getAgencies();
      this.getInitFiles();
      if(this.hwm.approval_id){
        this.getApproval();
        this.approved = true;
      }else{
        this.approved = false;
      }
      this.initForm();
      this.initHWMFileForm();
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

  formatUTCDates(date) {
    let hour = (date.split('T')[1]).split(':')[0];
    // minute
    let minute = date.split('T')[1].split(':')[1];
    let timestamp = date.split("T")[0];
    timestamp = timestamp.split("-");
    let day = timestamp[0];
    let month = timestamp[1];
    let year = timestamp[2];
    let utcPreview = new Date(Date.UTC(Number(day), Number(month) - 1, Number(year), Number(hour), Number(minute)));
    let formatted_date = utcPreview.toUTCString();
    return formatted_date;
  }

  getApproval() {
    this.hwmEditService.getApproval(this.hwm.approval_id)
      .subscribe((results) => {
        this.approvalDate = this.formatUTCDates(results.approval_date);
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

  
  /* istanbul ignore next */
  initHWMFileForm() {
    this.hwmFileForm = new FormGroup({
      File: new FormControl(this.selectedFile.File),
      file_id: new FormControl(this.selectedFile.FileEntity.file_id),
      name: new FormControl(this.selectedFile.FileEntity.name, Validators.required),
      FULLname: new FormControl(this.selectedFile.FileEntity.FULLname, Validators.required),
      source_id: new FormControl(this.selectedFile.FileEntity.source_id),
      description: new FormControl(this.selectedFile.FileEntity.description, Validators.required),
      file_date: new FormControl(this.selectedFile.FileEntity.file_date, Validators.required),
      photo_date: new FormControl(this.selectedFile.FileEntity.photo_date),
      agency_id: new FormControl(this.selectedFile.FileEntity.agency_id, Validators.required),
      hwm_id: new FormControl(this.hwm.hwm_id),
      site_id: new FormControl(this.selectedFile.FileEntity.site_id),
      filetype_id: new FormControl(this.selectedFile.FileEntity.filetype_id, Validators.required),
      path: new FormControl(this.selectedFile.FileEntity.path),
      last_updated: new FormControl(this.selectedFile.FileEntity.last_updated),
      last_updated_by: new FormControl(this.selectedFile.FileEntity.last_updated_by),
      site_description: new FormControl(this.selectedFile.FileEntity.site_description),
      photo_direction: new FormControl(this.selectedFile.FileEntity.photo_direction),
      latitude_dd: new FormControl(this.selectedFile.FileEntity.latitude_dd, [this.checkLatValue()]),
      longitude_dd: new FormControl(this.selectedFile.FileEntity.longitude_dd, [this.checkLonValue()]),
    })
  }

  /* istanbul ignore next */
  getFileTypeSelection(event) {
    this.selectedFile.FileEntity.filetype_id = event.value;
    if(this.selectedFile.FileEntity.filetype_id === 1){
      this.hwmFileForm.get("photo_date").setValidators([Validators.required]);
    }else{
      this.hwmFileForm.get("photo_date").clearValidators();
      this.hwmFileForm.get("photo_date").setErrors(null);
    }
  }

  /* istanbul ignore next */
  getFileTypes() {
    let self = this;
    this.siteService.getFileTypeLookup().subscribe((results) => {
      results.forEach(function(results){
        if (results.filetype === 'Photo' || results.filetype === 'Historic Citation' || results.filetype === 'Field Sheets' || results.filetype === 'Level Notes' ||
        results.filetype === 'Other' || results.filetype === 'Sketch' || results.filetype === 'Hydrograph'){
          self.fileTypes.push(results);
        }
      })
    });
  }

  /* istanbul ignore next */
  // Set file attributes
  getFileName(event) {
    this.selectedFile.FileEntity.name = event.target.files[0].name;
    this.hwmFileForm.controls['name'].setValue(this.selectedFile.FileEntity.name);
    this.selectedFile.File = event.target.files[0];
    this.hwmFileForm.controls['File'].setValue(this.selectedFile.File);
    this.fileUploading = true;
    if(this.selectedFile.FileEntity.filetype_id === 1){
      this.hwmFileForm.controls["photo_date"].setValidators([Validators.required]);
    }else{
      this.hwmFileForm.controls["photo_date"].clearValidators();
    }
  }

  /* istanbul ignore next */
  updateAgencyForCaption() {
    let self = this;
    this.agencyNameForCap = this.agencies.filter(function (a) { return a.agency_id == self.hwmFileForm.controls['agency_id'].value; })[0].agency_name;
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
  showFileCreate() {
    // Reset form
    this.cancelFile();
    this.showFileCreateForm = true;
    this.addFileType = "New";
    this.selectedFile.FileEntity.file_date = new Date();
    this.hwmFileForm.get("file_date").setValue(this.selectedFile.FileEntity.file_date);
    this.hwmFileForm.get("hwm_id").setValue(this.hwm.hwm_id);

    if(this.selectedFile.FileEntity.filetype_id === 1){
      this.selectedFile.FileEntity.photo_date = new Date();
      this.hwmFileForm.get("photo_date").setValue(this.selectedFile.FileEntity.photo_date);
    }
    
    // Set source name and agency automatically
    // Member id
    if(JSON.parse(localStorage.getItem('currentUser'))){
      let member_id = JSON.parse(localStorage.getItem('currentUser')).member_id;
      this.selectedFile.FileEntity.source_id = member_id;
      this.hwmFileForm.get('source_id').setValue(member_id);
      // FULLname
      this.selectedFile.FileEntity.FULLname = JSON.parse(localStorage.getItem('currentUser')).fname + " " +  JSON.parse(localStorage.getItem('currentUser')).lname;
      this.hwmFileForm.get('FULLname').setValue(this.selectedFile.FileEntity.FULLname);
      // Agency
      this.selectedFile.FileEntity.agency_id = JSON.parse(localStorage.getItem('currentUser')).agency_id;
      this.hwmFileForm.get('agency_id').setValue(this.selectedFile.FileEntity.agency_id);
      this.updateAgencyForCaption();
    }
  }

  /* istanbul ignore next */
  setInitFileEditForm(data) {
    this.hwmFileForm.get('file_id').setValue(data.file_id);
    this.hwmFileForm.get('name').setValue(data.name);
    this.hwmFileForm.get('FULLname').setValue(data.FULLname);
    this.hwmFileForm.get('description').setValue(data.description);
    this.hwmFileForm.get('file_date').setValue(data.file_date);
    this.hwmFileForm.get('photo_date').setValue(data.photo_date);
    this.hwmFileForm.get('agency_id').setValue(data.agency_id);
    this.hwmFileForm.get('source_id').setValue(data.source_id);
    this.hwmFileForm.get('site_id').setValue(data.site_id);
    this.hwmFileForm.get('filetype_id').setValue(data.filetype_id);
    this.hwmFileForm.get('path').setValue(data.path);
    this.hwmFileForm.get('last_updated').setValue(data.last_updated);
    this.hwmFileForm.get('last_updated_by').setValue(data.last_updated_by);
    this.hwmFileForm.get('site_description').setValue(data.site_description);
    this.hwmFileForm.get('photo_direction').setValue(data.photo_direction);
    this.hwmFileForm.get('latitude_dd').setValue(data.latitude_dd);
    this.hwmFileForm.get('longitude_dd').setValue(data.longitude_dd);
    this.hwmFileForm.get('hwm_id').setValue(this.hwm.hwm_id);
  }

  /* istanbul ignore next */
  setFileSourceAgency(source_id){
    this.siteService
    .getFileSource(source_id)
    .subscribe((results) => {
        this.selectedFile.FileEntity.agency_id = results.agency_id;
        this.agencyNameForCap = results.agency_name;
        this.hwmFileForm.controls['agency_id'].setValue(this.selectedFile.FileEntity.agency_id);
        this.sourceAgency = results.agency_name;
        if(this.previewCaption){
          if (this.sourceAgency === undefined || this.sourceAgency === ''){
            this.previewCaption["sourceAgency"] = '(source agency)';
          }else{
            this.previewCaption["sourceAgency"] = this.sourceAgency;
          }
        }
    });
  }

  /* istanbul ignore next */
  setFileSource(source_id){
    this.siteService
    .getSourceName(source_id)
    .subscribe((results) => {
        this.selectedFile.FileEntity.FULLname = results.source_name;
        this.hwmFileForm.controls['FULLname'].setValue(this.selectedFile.FileEntity.FULLname);
        this.sourceName = results.source_name;
        if(this.previewCaption){
          if (this.sourceName === undefined || this.sourceName === ''){
            this.previewCaption["sourceName"] = '(source name)'
          }else{
            this.previewCaption["sourceName"] = this.sourceName;
          }
        }
    });
  }

  /* istanbul ignore next */
  getAgencies() {
    this.siteService.getAgencyLookup().subscribe((results) => {
      this.agencies = results;
    });
  }

  /* istanbul ignore next */
  getFile() {
    if(this.selectedFile.FileEntity.file_id !== null && this.selectedFile.FileEntity.file_id !== undefined){
      this.siteService.getFileItem(this.selectedFile.FileEntity.file_id).subscribe((results) => {
        if(results.Length > 0) {
          this.fileItemExists = true;
          this.fileSource = APP_SETTINGS.API_ROOT + 'Files/' + this.selectedFile.FileEntity.file_id + '/item';
          this.selectedFile.FileEntity.name = results.FileName;
          this.hwmFileForm.get('name').setValue(this.selectedFile.FileEntity.name);
          this.setFileSourceAgency(this.selectedFile.FileEntity.source_id);
          this.setFileSource(this.selectedFile.FileEntity.source_id);
        }else{
          this.fileItemExists = false;
          this.setFileSourceAgency(this.selectedFile.FileEntity.source_id);
          this.setFileSource(this.selectedFile.FileEntity.source_id);
        }
      });
    }else{
      this.fileItemExists = false;
    }
  }

  /* istanbul ignore next */
  showFileDetails(row) {
    if(row) {
      this.expandedElement = row;
      this.showDetails = true;
      this.showFileForm = false;
      // Get filetype name
      this.fileType = this.fileTypeLookup(row.filetype_id);
      // Get source name and preview caption
      this.setFileSource(row.source_id);
      // Get agency ID
      this.setFileSourceAgency(row.source_id);

      this.previewCaption = {
        description: row.description,
        site_description: this.data.hwmSite.site_description,
        county: this.data.hwmSite.county,
        state: this.data.hwmSite.state,
        photo_date: row.photo_date,
        sourceName: this.sourceName,
        sourceAgency: this.sourceAgency,
      }

      // Replace any undefined preview caption info with placeholder
      if (row.description === undefined || row.description == ''){
        this.previewCaption.description = "(description)";
      }
      if (this.data.hwmSite.site_description === undefined || this.data.hwmSite.site_description == ''){
        this.previewCaption.site_description = '(site description)'
      }
      if (this.data.hwmSite.county === undefined || this.data.hwmSite.county == ''){
        this.previewCaption.county = '(county)'
      }
      if (this.data.hwmSite.state === undefined || this.data.hwmSite.state == ''){
        this.previewCaption.state = '(state)'
      }
      if (row.photo_date === undefined || row.photo_date == ''){
        this.previewCaption.photo_date = '(photo date)'
      }
      this.fileSource = APP_SETTINGS.API_ROOT + 'Files/' + row.file_id + '/item';
    }else{
      this.expandedElement = null;
      this.showDetails = false;
    }
  }

  /* istanbul ignore next */
  showFileEdit(row) {
    // Reset form
    if(row){
      this.cancelFile();
      this.setInitFileEditForm(row);
      this.expandedElement = row;
      this.showDetails = false;
      this.showFileForm = true;
      this.selectedFile.FileEntity.file_id = row.file_id;
      this.selectedFile.FileEntity.filetype_id = row.filetype_id;
      this.addFileType = "Existing";
      this.selectedFile.FileEntity.source_id = row.source_id;
      this.selectedFile.FileEntity.file_date = row.file_date;
      this.selectedFile.FileEntity.photo_date = row.photo_date !== undefined ? row.photo_date : null;
      this.selectedFile.FileEntity.photo_direction = row.photo_direction !== undefined && row.photo_direction !== "" ? row.photo_direction : null;
      this.selectedFile.FileEntity.latitude_dd = row.latitude_dd !== undefined && row.latitude_dd !== "" ? row.latitude_dd : null;
      this.selectedFile.FileEntity.longitude_dd = row.longitude_dd !== undefined && row.longitude_dd !== "" ? row.longitude_dd : null;
      this.selectedFile.FileEntity.site_id = this.data.site_id;
      this.selectedFile.FileEntity.name = row.name !== undefined && row.name !== "" ? row.name : null;
      this.selectedFile.FileEntity.hwm_id = this.hwm.hwm_id;
      
      this.hwmFileForm.get('file_date').setValue(this.selectedFile.FileEntity.file_date);
      this.hwmFileForm.get('photo_date').setValue(this.selectedFile.FileEntity.photo_date);
      this.hwmFileForm.get('file_id').setValue(this.selectedFile.FileEntity.file_id);
      this.hwmFileForm.get('photo_direction').setValue(this.selectedFile.FileEntity.photo_direction);
      this.hwmFileForm.get('latitude_dd').setValue(this.selectedFile.FileEntity.latitude_dd);
      this.hwmFileForm.get('longitude_dd').setValue(this.selectedFile.FileEntity.longitude_dd);
      this.hwmFileForm.get('site_id').setValue(this.selectedFile.FileEntity.site_id);
      this.hwmFileForm.get('name').setValue(this.selectedFile.FileEntity.name);
      this.hwmFileForm.get('hwm_id').setValue(this.selectedFile.FileEntity.hwm_id);
  
      this.getFile();
    }else{
      this.expandedElement = null;
      this.showFileForm = false;
    }
  }
  
  /* istanbul ignore next */
  fileTypeLookup(response) {
    for(let filetype of this.fileTypes){
      if(filetype.filetype_id === response){
        return filetype.filetype;
      }
    }
  }

  /* istanbul ignore next */
  cancelFile() {
    // Reset file inputs
    this.changeDetector.detectChanges();
    if(this.upload !== undefined){
      this.upload.nativeElement.value = '';
    }

    this.showFileForm = false;
    this.showFileCreateForm = false;
    this.expandedElement = null;
    this.fileUploading = false;

    this.hwmFileForm.reset();

    this.selectedFile = {
      FileEntity: {
        file_id: null,
        name: null,
        FULLname: null,
        source_id: null,
        description: null,
        file_date: null,
        photo_date: null,
        agency_id: null,
        site_id: null,
        filetype_id: null,
        path: null,
        last_updated: null,
        last_updated_by: null,
        site_description: null,
        photo_direction: null,
        latitude_dd: null,
        longitude_dd: null,
        hwm_id: null,
      },
      File: null
    };
  }

  /* istanbul ignore next */
  // Delete file
  deleteFile(row) {
    let dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: "Remove File",
        titleIcon: "close",
        message: "Are you sure you want to remove this file?",
        confirmButtonText: "OK",
        showCancelButton: true,
      },
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        this.fileEditService.deleteFile(row.file_id)
          .subscribe(
              (data) => {
                if(data === null){
                  // success
                  this.dialog.open(ConfirmComponent, {
                      data: {
                      title: "",
                      titleIcon: "close",
                      message: "Successfully removed file",
                      confirmButtonText: "OK",
                      showCancelButton: false,
                      },
                  });
                  let index;
                  for(let file of this.initHWMFiles){
                    if(file.file_id === row.file_id){
                      index = this.initHWMFiles.indexOf(file);
                      this.returnFiles.push({file: file, type: "delete"});
                    }
                  }
                  this.initHWMFiles.splice(index, 1);
                  this.initHWMFiles = [...this.initHWMFiles];
                  this.cancelFile();
                  this.showFileForm = false;
                  this.expandedElement = null;
              }else{
                  // error
                  this.dialog.open(ConfirmComponent, {
                      data: {
                      title: "Error",
                      titleIcon: "close",
                      message: "Error removing file",
                      confirmButtonText: "OK",
                      showCancelButton: false,
                      },
                  });
              }
            }
          );
      }
    });
  }

  /* istanbul ignore next */
  // Re-upload file or add missing file
  saveFileUpload() {
    let self = this;
    // update hwmFilesForm
    let fileSubmission = JSON.parse(JSON.stringify(this.hwmFileForm.value));
    // Convert dates to correct format - dates should already be in UTC, don't want to convert UTC dates to UTC again
    fileSubmission.photo_date = fileSubmission.photo_date ? this.formatUTCDates(fileSubmission.photo_date) : fileSubmission.photo_date;
    fileSubmission.file_date = fileSubmission.file_date ? this.formatUTCDates(fileSubmission.file_date) : fileSubmission.file_date;
    let formatFileSubmission = {
      file_id: fileSubmission.file_id,
      description: fileSubmission.description,
      source_id: fileSubmission.source_id,
      filetype_id: fileSubmission.filetype_id,
      latitude_dd: fileSubmission.latitude_dd,
      longitude_dd: fileSubmission.longitude_dd,
      file_date: fileSubmission.file_date,
      name: fileSubmission.name,
      photo_date: fileSubmission.photo_date,
      photo_direction: fileSubmission.photo_direction,
      site_id: this.data.site_id,
      hwm_id: this.hwm.hwm_id,
    }
    let fd = new FormData();
    fd.append("FileEntity", JSON.stringify(formatFileSubmission));
    fd.append("File", this.hwmFileForm.controls["File"].value);
    // post file
    this.fileEditService.uploadFile(fd)
      .subscribe(
          (data) => {
            if(data.length !== []){
              this.initHWMFiles.forEach(function(file, i){
                if(file.file_id === data.file_id){
                  self.returnFiles.push({file: file, type: "update"});
                  self.initHWMFiles[i] = data;
                  self.initHWMFiles = [...self.initHWMFiles];
                  self.showFileForm = false;
                  self.showFileCreateForm = false;
                  self.expandedElement = null;
                }
              });
              this.loading = false;
            }
          }
      );
    this.fileUploading = false;
    this.fileItemExists = true;
  }

  /* istanbul ignore next */
  saveFile() {
    let self = this;
    this.hwmFileForm.markAllAsTouched();
    let fileSubmission = JSON.parse(JSON.stringify(this.hwmFileForm.value));
    // Convert dates to correct format - dates should already be in UTC, don't want to convert UTC dates to UTC again
    fileSubmission.photo_date = fileSubmission.photo_date ? this.formatUTCDates(fileSubmission.photo_date) : fileSubmission.photo_date;
    fileSubmission.file_date = fileSubmission.file_date ? this.formatUTCDates(fileSubmission.file_date) : fileSubmission.file_date;
    if(this.hwmFileForm.valid){
      this.fileValid = true;
      if(fileSubmission.source_id !== null){
        let theSource = { source_name: fileSubmission.FULLname, agency_id: fileSubmission.agency_id };
        this.siteEditService.postSource(theSource)
        .subscribe(
            (response) => {
              fileSubmission.source_id = response.source_id;
              fileSubmission.fileBelongsTo = "HWM File";
              fileSubmission.fileType = this.fileTypeLookup(fileSubmission.filetype_id);
              
              delete fileSubmission.is_nwis; delete fileSubmission.FULLname;
              delete fileSubmission.last_updated; delete fileSubmission.last_updated_by; delete fileSubmission.File; delete fileSubmission.agency_id;
              this.fileEditService.updateFile(fileSubmission.file_id, fileSubmission)
                .subscribe(
                    (data) => {
                      self.initHWMFiles.forEach(function(file, i){
                        if(file.file_id === data.file_id){
                          self.returnFiles.push({file: data, type: "update"});
                          self.initHWMFiles[i] = data;
                          self.initHWMFiles = [...self.initHWMFiles];
                          self.showFileForm = false;
                          self.expandedElement = null;
                        }
                      });
                    }
                );
            }
        )
      }
    }else{
      this.loading = false;
      this.fileValid = false;
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "",
          titleIcon: "close",
          message: "Some required HWM file fields are missing or incorrect.  Please fix these fields before submitting.",
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
    }
  }

  /* istanbul ignore next */
  createFile() {
    let self = this;
    this.loading = true;
    this.hwmFileForm.markAllAsTouched();
    let fileSubmission = JSON.parse(JSON.stringify(this.hwmFileForm.value));
    // Convert dates to correct format - dates should already be in UTC, don't want to convert UTC dates to UTC again
    fileSubmission.photo_date = fileSubmission.photo_date ? this.formatUTCDates(fileSubmission.photo_date) : fileSubmission.photo_date;
    fileSubmission.file_date = fileSubmission.file_date ? this.formatUTCDates(fileSubmission.file_date) : fileSubmission.file_date;
    if(this.hwmFileForm.valid){
      this.fileValid = true;
      // check if source already exists?
      let theSource = { source_name: fileSubmission.FULLname, agency_id: fileSubmission.agency_id };
      
      //post source first to get source_id
      this.siteEditService.postSource(theSource)
      .subscribe(
          (response) => {
            fileSubmission.source_id = response.source_id;
            delete fileSubmission.FULLname; delete fileSubmission.agency_id; delete fileSubmission.site_description; delete fileSubmission.path;
            if (fileSubmission.filetype_id !== 8) {
              let formatFileSubmission = {
                  description: fileSubmission.description,
                  source_id: fileSubmission.source_id,
                  filetype_id: fileSubmission.filetype_id,
                  latitude_dd: fileSubmission.latitude_dd,
                  longitude_dd: fileSubmission.longitude_dd,
                  file_date: fileSubmission.file_date,
                  name: fileSubmission.name,
                  photo_date: fileSubmission.photo_date,
                  photo_direction: fileSubmission.photo_direction,
                  site_id: this.data.site_id,
                  hwm_id: this.hwm.hwm_id,
              }
              let fd = new FormData();
              fd.append("FileEntity", JSON.stringify(formatFileSubmission));
              fd.append("File", this.hwmFileForm.controls["File"].value);
              
              //then POST fileParts (Services populate PATH)
              this.siteEditService.uploadFile(fd)
                .subscribe(
                    (data) => {
                      if(data !== []){
                        self.returnFiles.push({file: data, type: "add"});
                        self.initHWMFiles.push(data);
                        self.initHWMFiles = [...self.initHWMFiles];
                      }
                        this.showFileForm = false;
                        this.showFileCreateForm = false;
                        this.expandedElement = null;
                        this.loading = false;
                    }
                );
            }else{
              fileSubmission.site_id = this.data.site_id;
              // Link FileTypes
              delete fileSubmission.File; delete fileSubmission.file_id; delete fileSubmission.is_nwis; delete fileSubmission.latitude_dd; delete fileSubmission.longitude_dd;
              delete fileSubmission.last_updated; delete fileSubmission.last_updated_by; delete fileSubmission.photo_direction; delete fileSubmission.path;

              this.siteEditService.saveFile(fileSubmission)
                .subscribe(
                    (data) => {
                      if(data !== []){
                        self.returnFiles.push({file: data, type: "add"});
                        self.initHWMFiles.push(data);
                        self.initHWMFiles = [...self.initHWMFiles];
                      }
                      this.loading = false;
                      this.showFileForm = false;
                      this.showFileCreateForm = false;
                      this.expandedElement = null;
                    }
                );
            }
          }
      );
    }else{
      this.fileValid = false;
      this.loading = false;
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "",
          titleIcon: "close",
          message: "Some required HWM file fields are missing or incorrect.  Please fix these fields before submitting.",
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
    }
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
