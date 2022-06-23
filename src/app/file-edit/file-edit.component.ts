import { F, I } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { APP_SETTINGS } from '@app/app.settings';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { CurrentUserService } from '@app/services/current-user.service';
import { FileEditService } from '@app/services/file-edit.service';
import { SiteEditService } from '@app/services/site-edit.service';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-file-edit',
  templateUrl: './file-edit.component.html',
  styleUrls: ['./file-edit.component.scss']
})
export class FileEditComponent implements OnInit {
  public file;
  public datafile;
  public site;
  public form;
  public fileType;
  public fileTypes = [];
  public fileCategory;
  public fileItemExists = false;
  public fileUploading = false;
  public fileSource;
  public agencies;
  public sourceAgency;
  public sourceName;
  public associatedFileUrl;
  public approvedBy;
  public approvedOn;
  public collectDate;
  public processorName;
  public previewCaption;
  public agencyNameForCap;
  public returnData;
  
  currentUser;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
    public dialog: MatDialog,
    public fileEditService: FileEditService,
    public siteEditService: SiteEditService,
    public currentUserService: CurrentUserService,
    private dialogRef: MatDialogRef<FileEditComponent>,
  ) {
    currentUserService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });
   }

  ngOnInit(): void {
    this.site = JSON.parse(JSON.stringify(this.data.siteInfo));
    this.fileCategory = JSON.parse(JSON.stringify(this.data.type));
    
    this.getFileTypes();
    this.getAgencies();
    // Edit file
    if(this.data.row_data !== null){
      this.file = JSON.parse(JSON.stringify(this.data.row_data));
      this.getFile();
      this.setFileType();
      if(this.file.source_id !== undefined){
        this.setSourceAgency();
        this.setSource();
      }
      this.associatedFileUrl = APP_SETTINGS.API_ROOT + 'Files/' + this.file.file_id + '/Item';
      let associatedFile = document.querySelector("#associatedFile");
      if(associatedFile !== null){
        associatedFile.setAttribute('href', this.associatedFileUrl);
      }

      this.previewCaption = {
        description: this.data.row_data.description,
        site_description: this.data.siteInfo.site_description,
        county: this.data.siteInfo.county,
        state: this.data.siteInfo.state,
        photo_date: this.data.row_data.photo_date,
        sourceName: this.sourceName,
        sourceAgency: this.sourceAgency,
      }

      // Replace any undefined preview caption info with placeholder
      if (this.file.description === undefined || this.file.description == ''){
        this.previewCaption.description = "(description)";
      }
      if (this.site.site_description === undefined || this.site.site_description == ''){
        this.previewCaption.site_description = '(site description)'
      }
      if (this.site.county === undefined || this.site.county == ''){
        this.previewCaption.county = '(county)'
      }
      if (this.site.state === undefined || this.site.state == ''){
        this.previewCaption.state = '(state)'
      }
      if (this.file.photo_date === undefined || this.file.photo_date == ''){
        this.previewCaption.photo_date = '(photo date)'
      }
    }else{
      // Add file
      this.file = {};
    }

    this.initForm();
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

  setFileType(){
      if(this.file.filetype_id === 2 && this.file.data_file_id !== undefined){
        this.siteService
        .getApproval(this.file.data_file_id)
        .subscribe((approvalResults) => {
            if(approvalResults !== null){
              this.approvedOn = approvalResults.approval_date;
              if(approvalResults.member_id !== undefined && approvalResults.member_id !== 0){
                this.siteService
                .getMemberName(approvalResults.member_id)
                .subscribe((member) => {
                  if(member.length === undefined || member.length > 0){
                    this.approvedBy = member.fname + " " + member.lname;
                  }
                });
              }
            }
        });
        this.siteService
        .getDataFile(this.file.data_file_id)
        .subscribe((datafileResults) => {
            this.datafile = datafileResults;
            this.collectDate = datafileResults.collect_date;
            this.form.get("collectDate").setValue(this.collectDate);
            if(datafileResults.processor_id !== undefined && datafileResults.processor_id !== 0){
              this.siteService
              .getMemberName(datafileResults.processor_id)
              .subscribe((memberResult) => {
                this.processorName = memberResult.fname + " " + memberResult.lname;
                this.file.processor_id = datafileResults.processor_id;
              });
            }
        });
      }
  }

  getAgencies() {
    this.siteService.getAgencyLookup().subscribe((results) => {
      this.agencies = results;
    });
  }

  getFile() {
    if(this.file.file_id !== null && this.file.file_id !== undefined){
      this.siteService.getFileItem(this.file.file_id).subscribe((results) => {
        if(results.Length > 0) {
          this.fileItemExists = true;
          this.fileSource = APP_SETTINGS.API_ROOT + 'Files/' + this.file.file_id + '/Item';
          this.file.name = results.FileName;
          this.form.controls['name'].setValue(this.file.name);
        }else{
          this.fileItemExists = false;
        }
      });
    }else{
      this.fileItemExists = false;
    }
  }

  getFileTypes() {
    let self = this;
    let fileTypes;
    this.siteService.getFileTypeLookup().subscribe((results) => {
      fileTypes = results;
      if(self.data.addOrEdit === 'Add'){
        this.fileTypes = fileTypes.filter(function (ft) {
            if(self.fileCategory === 'Site File')
              return ft.filetype === 'Photo' || ft.filetype === 'Historic Citation' || ft.filetype === 'Field Sheets' ||
                ft.filetype === 'Level Notes' || ft.filetype === 'Site Sketch' || ft.filetype === 'Other' || ft.filetype === 'Link' || ft.filetype === 'Sketch' ||
                ft.filetype === 'Landowner Permission Form' || ft.filetype === 'Hydrograph';
            else if(self.fileCategory === 'HWM File')
              return ft.filetype === 'Photo' || ft.filetype === 'Historic Citation' || ft.filetype === 'Field Sheets' || ft.filetype === 'Level Notes' ||
                ft.filetype === 'Other' || ft.filetype === 'Sketch' || ft.filetype === 'Hydrograph';
            else if(self.fileCategory === 'Reference Datum File')   
              return ft.filetype === 'Photo' || ft.filetype === 'Field Sheets' || ft.filetype === 'Level Notes' || ft.filetype === 'Other' || ft.filetype === 'Sketch' ||
                ft.filetype === 'NGS Datasheet';
            else if(self.fileCategory === 'Sensor File')
              return ft.filetype === 'Photo' || ft.filetype === 'Data' || ft.filetype === 'Historic Citation' || ft.filetype === 'Field Sheets' || ft.filetype === 'Level Notes' ||
                ft.filetype === 'Other' || ft.filetype === 'Sketch' || ft.filetype === 'Hydrograph';
        });
      }else{
        this.fileTypes = fileTypes;
        this.fileType = this.fileTypeLookup(this.file.filetype_id);
      }
    });
  }

  fileTypeLookup(response) {
    for(let filetype of this.fileTypes){
      if(filetype.filetype_id === response){
        return filetype.filetype;
      }
    }
  }

  setSourceAgency(){
    this.siteService
    .getFileSource(this.file.source_id)
    .subscribe((results) => {
        this.file.agency_id = results.agency_id;
        this.agencyNameForCap = results.agency_name;
        this.form.controls['agency_id'].setValue(this.file.agency_id);
    });
  }

  setSource(){
    this.siteService
    .getSourceName(this.file.source_id)
    .subscribe((results) => {
        this.file.FULLname = results.source_name;
        this.form.controls['FULLname'].setValue(this.file.FULLname);
    });
  }

  range = function (x, min, max) {
    return x < min || x > max;
  }

  checkNaN = function(x){
    return isNaN(x);
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

  initForm() {
    this.form = new FormGroup({
      File: new FormControl(this.file.File !== undefined ? this.file.File : null),
      file_id: new FormControl(this.file.file_id !== undefined ? this.file.file_id : null),
      name: new FormControl(this.file.name !== undefined ? this.file.name : null, Validators.required),
      FULLname: new FormControl(this.file.FULLname !== undefined ? this.file.FULLname : null),
      source_id: new FormControl(this.file.source_id !== undefined ? this.file.source_id : null),
      description: new FormControl(this.file.description !== undefined ? this.file.description : null, Validators.required),
      file_date: new FormControl(this.file.file_date !== undefined ? this.file.file_date : null, Validators.required),
      photo_date: new FormControl(this.file.photo_date !== undefined ? this.file.photo_date : null),
      agency_id: new FormControl(this.file.agency_id !== undefined ? this.file.agency_id : null),
      site_id: new FormControl(this.file.site_id !== undefined ? this.file.site_id : null),
      hwm_id: new FormControl(this.file.hwm_id !== undefined ? this.file.hwm_id : null),
      data_file_id: new FormControl(this.file.data_file_id !== undefined ? this.file.data_file_id : null),
      instrument_id: new FormControl(this.file.instrument_id !== undefined ? this.file.instrument_id : null),
      objective_point_id: new FormControl(this.file.objective_point_id !== undefined ? this.file.objective_point_id : null),
      script_parent: new FormControl(this.file.script_parent !== undefined ? this.file.script_parent : null),
      filetype_id: new FormControl(this.file.filetype_id !== undefined ? this.file.filetype_id : null, Validators.required),
      path: new FormControl(this.file.path !== undefined ? this.file.path : null),
      photo_direction: new FormControl(this.file.photo_direction !== undefined ? this.file.photo_direction : null),
      latitude_dd: new FormControl(this.file.latitude_dd !== undefined ? this.file.latitude_dd : null, [this.checkLatValue()]),
      longitude_dd: new FormControl(this.file.longitude_dd !== undefined ? this.file.longitude_dd : null, [this.checkLonValue()]),
      is_nwis: new FormControl(this.file.is_nwis !== undefined ? this.file.is_nwis : null),
      collectDate: new FormControl(this.collectDate !== undefined ? this.collectDate : null),
      elevation_status: new FormControl(this.file.elevation_status !== undefined ? this.file.elevation_status : ""),
    })

    if(this.data.type === 'Sensor File'){
      this.form.controls["instrument_id"].setValidators([Validators.required]);
    }else if(this.data.type === 'HWM File'){
      this.form.controls["hwm_id"].setValidators([Validators.required]);
    }else if(this.data.type === 'Reference Datum File'){
      this.form.controls["objective_point_id"].setValidators([Validators.required]);
    }

    if(this.form.controls.filetype_id.value === 1){
      this.form.controls["photo_date"].setValidators([Validators.required]);
    }

    if(this.file.filetype_id !== 2){
      // Set required validator for source name
      this.form.get("FULLname").setValidators([Validators.required]);
      // Set required validator for agency
      this.form.get("agency_id").setValidators([Validators.required]);
    }
  }

  checkIfNWIS(event) {
    if(event.checked){
      this.file.is_nwis = 1;
    }else{
      this.file.is_nwis = undefined;
    }
  }

  updateAgencyForCaption() {
    let self = this;
    if (this.form.controls['filetype_id'].value == 1)
        this.agencyNameForCap = this.agencies.filter(function (a) { return a.agency_id == self.form.controls['agency_id'].value; })[0].agency_name;
  }

  getFileTypeSelection(event) {
    this.file.filetype_id = event.value;

    // Autopopulate date and source
    this.file.file_date = new Date();
    this.file.source_id = this.currentUser.member_id;
    this.file.agency_id = this.currentUser.agency_id;
    this.form.controls.file_date.setValue(this.file.file_date);
    this.form.controls.source_id.setValue(this.file.source_id);
    this.form.controls.agency_id.setValue(this.file.agency_id);

    // Photo files
    if(this.file.filetype_id === 1){
      this.file.photo_date = new Date();
      this.form.controls.photo_date.setValue(this.file.photo_date);
    }

    // All other files
    if(this.file.filetype_id !== 2){
      // Set required validator for agency
      this.form.get("agency_id").setValidators([Validators.required]);
      this.file.FULLname = this.currentUser.fname + ' ' + this.currentUser.lname;
      this.form.controls.FULLname.setValue(this.file.FULLname);
    }

    // Data files
    if(this.file.filetype_id === 2){
      this.file.processor_id = this.currentUser.member_id;
      this.collectDate = new Date();
      this.form.controls.collectDate.setValue(new Date());
      this.processorName = this.currentUser.fname + ' ' + this.currentUser.lname;
    }
  }

  // Set file attributes
  getFileName(event) {
    this.file.name = event.target.files[0].name;
    this.form.controls['name'].setValue(this.file.name);
    this.file.File = event.target.files[0];
    this.form.controls['File'].setValue(this.file.File);
    this.fileUploading = true;
  }

  // Re-upload file or add missing file
  saveFileUpload() {
    let fileSubmission = JSON.parse(JSON.stringify(this.form.value));
    var fileParts = {
      FileEntity: {
          file_id: fileSubmission.file_id,
          name: fileSubmission.name,
          description: fileSubmission.description,
          photo_direction: fileSubmission.photo_direction,
          latitude_dd: fileSubmission.latitude_dd,
          longitude_dd: fileSubmission.longitude_dd,
          file_date: fileSubmission.file_date,
          hwm_id: fileSubmission.hwm_id,
          site_id: fileSubmission.site_id,
          filetype_id: fileSubmission.filetype_id,
          source_id: fileSubmission.source_id,
          path: fileSubmission.path,
          data_file_id: fileSubmission.data_file_id,
          instrument_id: fileSubmission.instrument_id,
          photo_date: fileSubmission.photo_date,
          is_nwis: fileSubmission.is_nwis,
          objective_point_id: fileSubmission.objective_point_id
      },
      File: this.form.controls['File'].value !== null ? this.form.controls['File'].value : this.form.controls['File'].value
    };
    //need to put the fileParts into correct format for post
    var fd = new FormData();
    fd.append("FileEntity", JSON.stringify(fileParts.FileEntity));
    fd.append("File", fileParts.File);
    // post file
    this.fileEditService.uploadFile(fd)
      .subscribe(
          (data) => {
            if(data.length !== []){
              this.loading = false;
            }
          }
      );

    this.fileItemExists = true;
    this.fileUploading = false;
  }

  submit() {
    this.form.markAllAsTouched();
    let fileSubmission = JSON.parse(JSON.stringify(this.form.value));
    if(this.form.valid){
      this.loading = true;
      if(this.data.addOrEdit === 'Edit'){
        // Convert dates to correct format - dates should already be in UTC, don't want to convert UTC dates to UTC again
        fileSubmission.photo_date = fileSubmission.photo_date ? this.formatUTCDates(fileSubmission.photo_date) : fileSubmission.photo_date;
        fileSubmission.file_date = fileSubmission.file_date ? this.formatUTCDates(fileSubmission.file_date) : fileSubmission.file_date;
        fileSubmission.collectDate = fileSubmission.collectDate ? this.formatUTCDates(fileSubmission.collectDate) : fileSubmission.collectDate;
        this.saveFile(fileSubmission);
      }else{
        this.createFile(fileSubmission);
      }
    }else{
      this.loading = false;
      let message;
      if(this.form.controls.name.invalid){
        message = "Please choose a file before submitting.";
      }else{
        message = "Some required file fields are missing or incorrect.  Please fix these fields before submitting.";
      }
      this.dialog.open(ConfirmComponent, {
        data: {
          title: "",
          titleIcon: "close",
          message: message,
          confirmButtonText: "OK",
          showCancelButton: false,
        },
      });
    }
  }

  saveFile(fileSubmission) {
    // Edit existing file
    // If data file
    if (fileSubmission.filetype_id == 2 && !fileSubmission.is_nwis) {
        // Data files don't submit a source
        this.datafile.instrument_id = fileSubmission.instrument_id;
        // Get id of current user
        this.datafile.processor_id = this.file.processor_id;
        // Set good_start and good_end to now in UTC
        this.datafile.good_start = this.datafile.good_start ? this.formatUTCDates(this.datafile.good_start) : this.datafile.good_start;
        this.datafile.good_end = this.datafile.good_end ? this.formatUTCDates(this.datafile.good_end) : this.datafile.good_end;
        this.datafile.time_zone = "UTC";
        this.datafile.collect_date = fileSubmission.collectDate;
        this.datafile.elevation_status = fileSubmission.elevation_status ? fileSubmission.elevation_status : null;
        // Delete extra fields
        delete fileSubmission.File; delete fileSubmission.agency_id; delete fileSubmission.source_id;
        delete fileSubmission.FULLname; delete fileSubmission.collectDate;
        if(fileSubmission.script_parent === null) {
          delete fileSubmission.script_parent;
        }
        // Remove instrument, hwm or op id from fileSubmission
        if(this.data.type === 'Sensor File'){
          delete fileSubmission.hwm_id;
          delete fileSubmission.objective_point_id;
        }else if(this.data.type === 'HWM File'){
          delete fileSubmission.instrument_id;
          delete fileSubmission.objective_point_id;
        }else if(this.data.type === 'Reference Datum File'){
          delete fileSubmission.hwm_id;
          delete fileSubmission.instrument_id;
        }
        this.fileEditService.updateDataFile(this.datafile.data_file_id, this.datafile).subscribe((dfresults) => {
          this.fileEditService.updateFile(fileSubmission.file_id, fileSubmission).subscribe((fresults) => {
            this.returnData = fresults;
            this.closeDialog("Successfully updated file");
          }, error => {
            this.closeDialog("Error saving file");
          });
        }, error => {
          this.closeDialog("Error saving file's data file");
        })
    }else if (fileSubmission.filetype_id == 2 && fileSubmission.is_nwis) {
      // Data files don't submit a source
      this.datafile.instrument_id = fileSubmission.instrument_id;
      // Get id of current user
      this.datafile.processor_id = this.file.processor_id;
      // Set good_start and good_end to now in UTC
      this.datafile.good_start = this.datafile.good_start ? this.formatUTCDates(this.datafile.good_start) : this.datafile.good_start;
      this.datafile.good_end = this.datafile.good_end ? this.formatUTCDates(this.datafile.good_end) : this.datafile.good_end;
      this.datafile.time_zone = "UTC";
      this.datafile.collect_date = fileSubmission.collectDate;
      this.datafile.elevation_status = fileSubmission.elevation_status ? fileSubmission.elevation_status : null;
      // Delete extra fields
      delete fileSubmission.File; delete fileSubmission.agency_id; delete fileSubmission.source_id;
      delete fileSubmission.FULLname; delete fileSubmission.collectDate;
      if(fileSubmission.script_parent === null) {
        delete fileSubmission.script_parent;
      }
      // Remove instrument, hwm or op id from fileSubmission
      if(this.data.type === 'Sensor File'){
        delete fileSubmission.hwm_id;
        delete fileSubmission.objective_point_id;
      }else if(this.data.type === 'HWM File'){
        delete fileSubmission.instrument_id;
        delete fileSubmission.objective_point_id;
      }else if(this.data.type === 'Reference Datum File'){
        delete fileSubmission.hwm_id;
        delete fileSubmission.instrument_id;
      }
      // If NWIS datafile
      this.fileEditService.updateDataFile(this.datafile.data_file_id, this.datafile).subscribe((dfresults) => {
          this.fileEditService.updateFile(fileSubmission.file_id, fileSubmission).subscribe((fresults) => {
            this.returnData = fresults;
            this.closeDialog("Successfully updated file");
          }, error => {
            this.closeDialog("Error saving file");
          });
      }, error => {
        this.closeDialog("Error saving file's data file");
      })
    }else {
      let theSource = { source_name: fileSubmission.FULLname, agency_id: fileSubmission.agency_id };
      this.siteEditService.postSource(theSource)
      .subscribe(
          (response) => {
            if(response !== []){
              fileSubmission.source_id = response.source_id;
              // Delete extra fields
              delete fileSubmission.File; delete fileSubmission.agency_id; delete fileSubmission.elevation_status;
              delete fileSubmission.FULLname; delete fileSubmission.collectDate;
              if(fileSubmission.script_parent === null) {
                delete fileSubmission.script_parent;
              }
              delete fileSubmission.data_file_id; delete fileSubmission.is_nwis;
              // Remove instrument, hwm or op id from fileSubmission
              if(this.data.type === 'Sensor File'){
                delete fileSubmission.hwm_id;
                delete fileSubmission.objective_point_id;
              }else if(this.data.type === 'HWM File'){
                delete fileSubmission.instrument_id;
                delete fileSubmission.objective_point_id;
              }else if(this.data.type === 'Reference Datum File'){
                delete fileSubmission.hwm_id;
                delete fileSubmission.instrument_id;
              }
              this.fileEditService.updateFile(fileSubmission.file_id, fileSubmission)
                .subscribe(
                    (data) => {
                      this.returnData = data;
                      this.closeDialog("Successfully updated file");
                    }
                );
            }else{
              this.closeDialog("Error saving source");
            }
          }
      )
    }
  }

  createFile(fileSubmission) {
    ///// TODO - In progress to add sensor/data files 
    // Create new file
    // if (fileSubmission.filetype_id == 2) {
    //   // Create new data file
    //   let valid = false;
    //   //make sure end date is after start date
    //   var s = fileSubmission.good_start;//need to get dep status date in same format as retrieved to compare
    //   var e = fileSubmission.good_end; //stupid comma in there making it not the same
    //   if (new Date(e) < new Date(s)) {
    //       valid = false;
    //       this.loading = false;
    //       this.dialog.open(ConfirmComponent, {
    //         data: {
    //           title: "",
    //           titleIcon: "close",
    //           message: "The good end date must be after the good start date.",
    //           confirmButtonText: "OK",
    //           showCancelButton: false,
    //         },
    //       });
    //   }else if(s === undefined || e === undefined) {
    //     valid = false;
    //       this.loading = false;
    //       this.dialog.open(ConfirmComponent, {
    //         data: {
    //           title: "Error",
    //           titleIcon: "close",
    //           message: "The good data start date or good data end date is missing. Either choose a date, or click Preview Data to get a chart of the data, where you can choose the dates.",
    //           confirmButtonText: "OK",
    //           showCancelButton: false,
    //         },
    //       });
    //   }else{
    //     valid = true;
    //     if (this.datafile.data_file_id !== undefined) {
    //       //has DATA_FILE
    //       //check timezone and make sure date stays utc
    //       this.datafile.instrument_id = fileSubmission.instrument_id;
    //       // Get id of current user
    //       // this.datafile.processor_id = localStorage.currentUser.member_id;
    //       this.fileEditService.addDataFile(this.datafile).subscribe((dfresults) => {
    //         //then POST fileParts (Services populate PATH)
    //         var fileParts = {
    //             FileEntity: {
    //                 filetype_id: fileSubmission.filetype_id,
    //                 name: fileSubmission.File.name,
    //                 file_date: fileSubmission.file_date,
    //                 description: fileSubmission.description,
    //                 site_id: this.site.site_id,
    //                 data_file_id: dfresults.data_file_id,
    //                 photo_direction: fileSubmission.photo_direction,
    //                 latitude_dd: fileSubmission.latitude_dd,
    //                 longitude_dd: fileSubmission.longitude_dd,
    //                 instrument_id: fileSubmission.instrument_id
    //             },
    //             File: fileSubmission.File
    //         };
    //         //need to put the fileParts into correct format for post
    //         var fd = new FormData();
    //         fd.append("FileEntity", JSON.stringify(fileParts.FileEntity));
    //         fd.append("File", fileParts.File);
    //         this.fileEditService.uploadFile(fd).subscribe((fresults) => {
    //           this.returnData = fresults;
    //         });
    //         // Error handling - if file did not get created, delete data file
    //       })
    //     }
    //   }
    // }else {
          // Create new file (not data file)
          let theSource = { source_name: fileSubmission.FULLname, agency_id: fileSubmission.agency_id };
          this.siteEditService.postSource(theSource)
          .subscribe(
              (response) => {
                if(response !== []){
                  delete fileSubmission.FULLname; delete fileSubmission.collectDate; delete fileSubmission.elevation_status;
                  delete fileSubmission.File; delete fileSubmission.agency_id;

                  if (fileSubmission.filetype_id !== 8) {
                      var fileParts = {
                        FileEntity: {
                            filetype_id: fileSubmission.filetype_id,
                            name: fileSubmission.name,
                            file_date: fileSubmission.file_date,
                            photo_date: fileSubmission.photo_date,
                            description: fileSubmission.description,
                            site_id: this.site.site_id,
                            source_id: response.source_id,
                            photo_direction: fileSubmission.photo_direction,
                            instrument_id: fileSubmission.instrument_id,
                            hwm_id: fileSubmission.hwm_id,
                            objective_point_id: fileSubmission.objective_point_id,
                        },
                        File: this.form.controls['File'].value
                      };
                      // Remove instrument, hwm or op id from fileParts.FileEntity
                      if(this.data.type === 'Sensor File'){
                        delete fileParts.FileEntity.hwm_id;
                        delete fileParts.FileEntity.objective_point_id;
                      }else if(this.data.type === 'HWM File'){
                        delete fileParts.FileEntity.instrument_id;
                        delete fileParts.FileEntity.objective_point_id;
                      }else if(this.data.type === 'Reference Datum File'){
                        delete fileParts.FileEntity.hwm_id;
                        delete fileParts.FileEntity.instrument_id;
                      }
                      let fd = new FormData();
                      fd.append("FileEntity", JSON.stringify(fileParts.FileEntity));
                      fd.append("File", fileParts.File);
                      this.fileEditService.uploadFile(fd)
                        .subscribe(
                            (data) => {
                              this.returnData = data;
                              this.closeDialog("Successfully added file");
                            }
                        );
                  }else{
                    // Link file
                    fileSubmission.site_id = this.site.site_id;
                    fileSubmission.source_id = response.source_id;

                    // Remove extra photo fields
                    // delete fileSubmission.latitude_dd; delete fileSubmission.longitude_dd; delete fileSubmission.photo_direction; delete fileSubmission.path; delete fileSubmission.photo_date;
                    if(fileSubmission.script_parent === null) {
                      delete fileSubmission.script_parent;
                    }

                    this.fileEditService.addFile(fileSubmission)
                        .subscribe(
                            (data) => {
                              this.returnData = data;
                              this.closeDialog("Successfully added file");
                            }
                        );
                  }
                }else{
                  this.closeDialog("Error saving source")
                }
            })
      // }
  }

  closeDialog(message) {
    this.dialogRef.close(this.returnData);
    this.loading = false;
    this.fileUploading = false;
    this.dialog.open(ConfirmComponent, {
      data: {
        title: message,
        titleIcon: "check",
        message: null,
        confirmButtonText: "OK",
        showCancelButton: false,
      },
    });
    return;
  }
}
