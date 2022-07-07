import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { OpEditService } from '@app/services/op-edit.service';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { FileEditComponent } from '@app/file-edit/file-edit.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SiteEditService } from '@app/services/site-edit.service';
import { FileEditService } from '@app/services/file-edit.service';
import { APP_SETTINGS } from '@app/app.settings';

@Component({
  selector: 'app-ref-datum-edit',
  templateUrl: './ref-datum-edit.component.html',
  styleUrls: ['./ref-datum-edit.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RefDatumEditComponent implements OnInit {
  @ViewChild('upload', {static: false}) upload: ElementRef;
  
  public form;
  public rdFileForm;
  public rd;
  public hmethods;
  public hdatums;
  public vmethods;
  public vdatums;
  public opQualities;
  public types;
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
    returnFiles: [],
  };
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
      objective_point_id: null,
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

  infoExpanded = true;
  filesExpanded = false;
  editOrCreate;
  expandedElement: any;
  showFileForm = false;
  showFileCreateForm = false;
  showDetails = false;

  constructor(
    private dialogRef: MatDialogRef<RefDatumEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
    public opEditService: OpEditService,
    public siteEditService: SiteEditService,
    public fileEditService: FileEditService,
    public dialog: MatDialog,
    private changeDetector : ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.rd = this.data.rd;
    this.hmethods = this.data.hmethodList;
    this.hdatums = this.data.hdatumList;

    this.getOPQuality();
    this.getOPTypes();
    this.getVDatums();
    this.getVMethods();

    if(this.rd !== null){
      this.editOrCreate = "Edit";
      if(this.rd.unquantified === "1"){
        this.unquantified = true;
      }

      this.getInitFiles();
      this.getControlID();
      this.getFileTypes();
      this.getAgencies();
      this.initRDFileForm();

    }else {
      this.editOrCreate = "Create";
      this.rd = {};
      this.rd.latitude_dd = this.data.rdSite.latitude_dd;
      this.rd.longitude_dd = this.data.rdSite.longitude_dd;
      this.rd.hdatum_id = this.data.rdSite.hdatum_id;
      //default today for established date
      this.rd.date_established = this.makeAdate("");
    }
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

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  changeControlID(event, i, control) {
    this.form.controls["op_control_identifier"].controls[i].controls.identifier_type.setValue(control.identifier_type);
    this.controlsToAdd[i].identifier_type = control.identifier_type;
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  initRDFileForm() {
    this.rdFileForm = new FormGroup({
      File: new FormControl(this.selectedFile.File),
      file_id: new FormControl(this.selectedFile.FileEntity.file_id),
      name: new FormControl(this.selectedFile.FileEntity.name, Validators.required),
      FULLname: new FormControl(this.selectedFile.FileEntity.FULLname, Validators.required),
      source_id: new FormControl(this.selectedFile.FileEntity.source_id),
      description: new FormControl(this.selectedFile.FileEntity.description, Validators.required),
      file_date: new FormControl(this.selectedFile.FileEntity.file_date, Validators.required),
      photo_date: new FormControl(this.selectedFile.FileEntity.photo_date),
      agency_id: new FormControl(this.selectedFile.FileEntity.agency_id, Validators.required),
      objective_point_id: new FormControl(this.rd.objective_point_id),
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
      this.rdFileForm.get("photo_date").setValidators([Validators.required]);
    }else{
      this.rdFileForm.get("photo_date").clearValidators();
      this.rdFileForm.get("photo_date").setErrors(null);
    }
  }

  /* istanbul ignore next */
  getFileTypes() {
    let self = this;
    this.siteService.getFileTypeLookup().subscribe((results) => {
      results.forEach(function(results){
        if (results.filetype === 'Photo' || results.filetype === 'Field Sheets' || results.filetype === 'Level Notes' || results.filetype === 'Other' || results.filetype === 'Sketch' ||
        results.filetype === 'NGS Datasheet'){
          self.fileTypes.push(results);
        }
      })
    });
  }

  /* istanbul ignore next */
  // Set file attributes
  getFileName(event) {
    this.selectedFile.FileEntity.name = event.target.files[0].name;
    this.rdFileForm.controls['name'].setValue(this.selectedFile.FileEntity.name);
    this.selectedFile.File = event.target.files[0];
    this.rdFileForm.controls['File'].setValue(this.selectedFile.File);
    this.fileUploading = true;
    if(this.selectedFile.FileEntity.filetype_id === 1){
      this.rdFileForm.controls["photo_date"].setValidators([Validators.required]);
    }else{
      this.rdFileForm.controls["photo_date"].clearValidators();
    }
  }

  /* istanbul ignore next */
  updateAgencyForCaption() {
    let self = this;
    this.agencyNameForCap = this.agencies.filter(function (a) { return a.agency_id == self.rdFileForm.controls['agency_id'].value; })[0].agency_name;
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  checkDDLonDegValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.range(control.value, -175, -60) || this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  /* istanbul ignore next */
  checkDDLonMinValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  /* istanbul ignore next */
  checkDDLonSecValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  /* istanbul ignore next */
  checkDDLatDegValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.range(control.value, 0, 73) || this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  /* istanbul ignore next */
  checkDDLatMinValue() {
    return (control: AbstractControl): ValidationErrors | null => {
      const incorrect = this.checkNaN(control.value) || control.value === undefined;
      return incorrect ? {incorrectValue: {value: control.value}} : null;
    };
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  showFileCreate() {
    // Reset form
    this.cancelFile();
    this.showFileCreateForm = true;
    this.addFileType = "New";
    this.selectedFile.FileEntity.file_date = new Date();
    this.rdFileForm.get("file_date").setValue(this.selectedFile.FileEntity.file_date);
    this.rdFileForm.get("objective_point_id").setValue(this.rd.objective_point_id);

    if(this.selectedFile.FileEntity.filetype_id === 1){
      this.selectedFile.FileEntity.photo_date = new Date();
      this.rdFileForm.get("photo_date").setValue(this.selectedFile.FileEntity.photo_date);
    }

    // Set source name and agency automatically
    // Member id
    if(JSON.parse(localStorage.getItem('currentUser'))){
      let member_id = JSON.parse(localStorage.getItem('currentUser')).member_id;
      this.selectedFile.FileEntity.source_id = member_id;
      this.rdFileForm.get('source_id').setValue(member_id);
      // FULLname
      this.selectedFile.FileEntity.FULLname = JSON.parse(localStorage.getItem('currentUser')).fname + " " +  JSON.parse(localStorage.getItem('currentUser')).lname;
      this.rdFileForm.get('FULLname').setValue(this.selectedFile.FileEntity.FULLname);
      // Agency
      this.selectedFile.FileEntity.agency_id = JSON.parse(localStorage.getItem('currentUser')).agency_id;
      this.rdFileForm.get('agency_id').setValue(this.selectedFile.FileEntity.agency_id);
      this.updateAgencyForCaption();
    }
  }

  /* istanbul ignore next */
  setInitFileEditForm(data) {
    this.rdFileForm.get('file_id').setValue(data.file_id);
    this.rdFileForm.get('name').setValue(data.name);
    this.rdFileForm.get('FULLname').setValue(data.FULLname);
    this.rdFileForm.get('description').setValue(data.description);
    this.rdFileForm.get('file_date').setValue(data.file_date);
    this.rdFileForm.get('photo_date').setValue(data.photo_date);
    this.rdFileForm.get('agency_id').setValue(data.agency_id);
    this.rdFileForm.get('source_id').setValue(data.source_id);
    this.rdFileForm.get('site_id').setValue(data.site_id);
    this.rdFileForm.get('filetype_id').setValue(data.filetype_id);
    this.rdFileForm.get('path').setValue(data.path);
    this.rdFileForm.get('last_updated').setValue(data.last_updated);
    this.rdFileForm.get('last_updated_by').setValue(data.last_updated_by);
    this.rdFileForm.get('site_description').setValue(data.site_description);
    this.rdFileForm.get('photo_direction').setValue(data.photo_direction);
    this.rdFileForm.get('latitude_dd').setValue(data.latitude_dd);
    this.rdFileForm.get('longitude_dd').setValue(data.longitude_dd);
    this.rdFileForm.get('objective_point_id').setValue(this.rd.objective_point_id);
  }

  /* istanbul ignore next */
  setFileSourceAgency(source_id){
    this.siteService
    .getFileSource(source_id)
    .subscribe((results) => {
        this.selectedFile.FileEntity.agency_id = results.agency_id;
        this.agencyNameForCap = results.agency_name;
        this.rdFileForm.controls['agency_id'].setValue(this.selectedFile.FileEntity.agency_id);
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
        this.rdFileForm.controls['FULLname'].setValue(this.selectedFile.FileEntity.FULLname);
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
          this.rdFileForm.get('name').setValue(this.selectedFile.FileEntity.name);
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
        site_description: this.data.rdSite.site_description,
        county: this.data.rdSite.county,
        state: this.data.rdSite.state,
        photo_date: row.photo_date,
        sourceName: this.sourceName,
        sourceAgency: this.sourceAgency,
      }

      // Replace any undefined preview caption info with placeholder
      if (row.description === undefined || row.description == ''){
        this.previewCaption.description = "(description)";
      }
      if (this.data.rdSite.site_description === undefined || this.data.rdSite.site_description == ''){
        this.previewCaption.site_description = '(site description)'
      }
      if (this.data.rdSite.county === undefined || this.data.rdSite.county == ''){
        this.previewCaption.county = '(county)'
      }
      if (this.data.rdSite.state === undefined || this.data.rdSite.state == ''){
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
      this.selectedFile.FileEntity.objective_point_id = this.rd.objective_point_id;

      this.rdFileForm.get('file_date').setValue(this.selectedFile.FileEntity.file_date);
      this.rdFileForm.get('photo_date').setValue(this.selectedFile.FileEntity.photo_date);
      this.rdFileForm.get('file_id').setValue(this.selectedFile.FileEntity.file_id);
      this.rdFileForm.get('photo_direction').setValue(this.selectedFile.FileEntity.photo_direction);
      this.rdFileForm.get('latitude_dd').setValue(this.selectedFile.FileEntity.latitude_dd);
      this.rdFileForm.get('longitude_dd').setValue(this.selectedFile.FileEntity.longitude_dd);
      this.rdFileForm.get('site_id').setValue(this.selectedFile.FileEntity.site_id);
      this.rdFileForm.get('name').setValue(this.selectedFile.FileEntity.name);
      this.rdFileForm.get('objective_point_id').setValue(this.selectedFile.FileEntity.objective_point_id);

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

    this.rdFileForm.reset();

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
        objective_point_id: null,
      },
      File: null
    };
  }

  /* istanbul ignore next */
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
    let formatted_date = new Date(utcPreview).toUTCString();
    return formatted_date;
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
                  for(let file of this.initDatumFiles){
                    if(file.file_id === row.file_id){
                      index = this.initDatumFiles.indexOf(file);
                      this.returnData.returnFiles.push({file: file, type: "delete"});
                    }
                  }
                  this.initDatumFiles.splice(index, 1);
                  this.initDatumFiles = [...this.initDatumFiles];
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
    // update rdFilesForm
    let fileSubmission = JSON.parse(JSON.stringify(this.rdFileForm.value));
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
      objective_point_id: this.rd.objective_point_id,
    }
    let fd = new FormData();
    fd.append("FileEntity", JSON.stringify(formatFileSubmission));
    fd.append("File", this.rdFileForm.controls["File"].value);
    // post file
    this.fileEditService.uploadFile(fd)
      .subscribe(
          (data) => {
            if(data.length !== []){
              this.initDatumFiles.forEach(function(file, i){
                if(file.file_id === data.file_id){
                  self.returnData.returnFiles.push({file: file, type: "update"});
                  self.initDatumFiles[i] = data;
                  self.initDatumFiles = [...self.initDatumFiles];
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
    this.rdFileForm.markAllAsTouched();
    let fileSubmission = JSON.parse(JSON.stringify(this.rdFileForm.value));
    // Convert dates to correct format - dates should already be in UTC, don't want to convert UTC dates to UTC again
    fileSubmission.photo_date = fileSubmission.photo_date ? this.formatUTCDates(fileSubmission.photo_date) : fileSubmission.photo_date;
    fileSubmission.file_date = fileSubmission.file_date ? this.formatUTCDates(fileSubmission.file_date) : fileSubmission.file_date;
    if(this.rdFileForm.valid){
      this.fileValid = true;
      if(fileSubmission.source_id !== null){
        let theSource = { source_name: fileSubmission.FULLname, agency_id: fileSubmission.agency_id };
        this.siteEditService.postSource(theSource)
        .subscribe(
            (response) => {
              fileSubmission.source_id = response.source_id;
              fileSubmission.fileBelongsTo = "Reference Datum File";
              fileSubmission.fileType = this.fileTypeLookup(fileSubmission.filetype_id);

              delete fileSubmission.is_nwis; delete fileSubmission.FULLname;
              delete fileSubmission.last_updated; delete fileSubmission.last_updated_by; delete fileSubmission.File; delete fileSubmission.agency_id;
              this.fileEditService.updateFile(fileSubmission.file_id, fileSubmission)
                .subscribe(
                    (data) => {
                      self.initDatumFiles.forEach(function(file, i){
                        if(file.file_id === data.file_id){
                          self.returnData.returnFiles.push({file: data, type: "update"});
                          self.initDatumFiles[i] = data;
                          self.initDatumFiles = [...self.initDatumFiles];
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
          message: "Some required Reference Datum file fields are missing or incorrect.  Please fix these fields before submitting.",
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
    this.rdFileForm.markAllAsTouched();
    let fileSubmission = JSON.parse(JSON.stringify(this.rdFileForm.value));
    
    // Convert dates to correct format - dates should already be in UTC, don't want to convert UTC dates to UTC again
    fileSubmission.photo_date = fileSubmission.photo_date ? this.formatUTCDates(fileSubmission.photo_date) : fileSubmission.photo_date;
    fileSubmission.file_date = fileSubmission.file_date ? this.formatUTCDates(fileSubmission.file_date) : fileSubmission.file_date;

    if(this.rdFileForm.valid){
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
                  objective_point_id: this.rd.objective_point_id,
              }
              let fd = new FormData();
              fd.append("FileEntity", JSON.stringify(formatFileSubmission));
              fd.append("File", this.rdFileForm.controls["File"].value);

              //then POST fileParts (Services populate PATH)
              this.siteEditService.uploadFile(fd)
                .subscribe(
                    (data) => {
                      if(data !== []){
                        self.returnData.returnFiles.push({file: data, type: "add"});
                        self.initDatumFiles.push(data);
                        self.initDatumFiles = [...self.initDatumFiles];
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
                        self.returnData.returnFiles.push({file: data, type: "add"});
                        self.initDatumFiles.push(data);
                        self.initDatumFiles = [...self.initDatumFiles];
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
          message: "Some required Reference Datum file fields are missing or incorrect.  Please fix these fields before submitting.",
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
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "",
          titleIcon: "close",
          message: "Some required reference datum fields are missing or incorrect.  Please fix these fields before submitting.",
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
    }
  }

  async sendRequests() {
    let self = this;
    let promises = [];

    // Copy form value object and delete extra fields, include disabled form values in submission
    let rdSubmission = JSON.parse(JSON.stringify(this.form.getRawValue()));
    delete rdSubmission.latdeg; delete rdSubmission.latmin; delete rdSubmission.latsec; delete rdSubmission.londeg; delete rdSubmission.lonmin; delete rdSubmission.lonsec;
    delete rdSubmission.op_control_identifier;

    // set null values to 0
    rdSubmission.op_is_destroyed = rdSubmission.op_is_destroyed !== null ? rdSubmission.op_is_destroyed : 0;
    rdSubmission.vdatum_id = rdSubmission.vdatum_id !== null ? rdSubmission.vdatum_id : 0;
    rdSubmission.hdatum_id = rdSubmission.hdatum_id !== null ? rdSubmission.hdatum_id : 0;
    rdSubmission.hcollect_method_id = rdSubmission.hcollect_method_id !== null ? rdSubmission.hcollect_method_id : 0;
    rdSubmission.vcollect_method_id = rdSubmission.vcollect_method_id !== null ? rdSubmission.vcollect_method_id : 0;
    
    if(this.editOrCreate === "Edit"){
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
        let result = {result: this.returnData, editOrCreate: this.editOrCreate}
        this.dialogRef.close(result);
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
    }else if (this.editOrCreate === "Create") {
      delete rdSubmission.objective_point_id;
      const createRD = new Promise<string>(resolve => this.opEditService.createReferenceDatum(rdSubmission)
        .subscribe(
            (data) => {
              this.returnData.referenceDatums = data;
              resolve("Create reference datum success.");
              // Add control identifier array
              if(this.controlsToAdd.length > 0){
                for(let newControl of this.controlsToAdd){
                  delete newControl.last_updated; delete newControl.last_updated_by; delete newControl.op_control_identifier_id;
                  // Add new control - post
                  newControl.objective_point_id = data.objective_point_id;
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
              }
            }
        )
      )

      promises.push(createRD)

      Promise.all(promises).then(() => {
        let result = {result: this.returnData, editOrCreate: this.editOrCreate}
        this.dialogRef.close(result);
        this.loading = false;
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully created Reference Datum",
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

}