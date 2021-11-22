import { L } from '@angular/cdk/keycodes';
import { GlobalPositionStrategy } from '@angular/cdk/overlay';
import { HttpErrorResponse } from '@angular/common/http';
import { ConditionalExpr } from '@angular/compiler';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NetworkNameService } from '@app/services/network-name.service';
import { SiteEditService } from '@app/services/site-edit.service';
import { SiteService } from '@app/services/site.service';
import { APP_SETTINGS } from '../app.settings';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.scss']
})
export class SiteEditComponent implements OnInit {
  @ViewChild('upload', {static: false}) upload: ElementRef;

  public networkTypes;
  public networkNames;
  public selectedNetworkTypes = [];
  public selectedNetworkNames = [];
  public hDatums;
  public hMethods;
  public siteHousings;
  public stateList;
  public countyList;
  public perm_housing_installed;
  public sensorNotAppropriate;
  public accessGranted;
  public siteHousingArray = [];
  public housingTypeArray = [];
  public siteHousingLookup;
  public fileTypes = [];
  public initSiteFiles = [];
  public priority;
  public priorityList = [];
  public latLngUnit = 'decdeg';
  public agencies = [];
  public agencyNameForCap;
  public formattedPhotoDate;
  public fileSource;
  public addFileType;
  public valid;
  public landownerValid;
  public fileValid;
  // public existingFile = {
  //   file_id: null,
  //   filetype_id: null,
  // };
  public dms = {
    latdeg: null,
    latmin: null,
    latsec: null,
    londeg: null,
    lonmin: null,
    lonsec: null,
  }
  public siteFiles = {
    file_id: null,
    name: null,
    FULLname: null,
    description: null,
    file_date: null,
    photo_date: null,
    agency_id: null,
    site_id: null,
    filetype_id: null,
    path: null,
    data_file_id: null,
    instrument_id: null,
    last_updated: null,
    last_updated_by: null,
    site_description: null,
    photo_direction: null,
    latitude_dd: null,
    longitude_dd: null,
  };
  public site = {
    description: null,
    internal_notes: null,
    latitude_dd: null,
    longitude_dd: null,
    hdatum: null,
    hmethod: null,
    waterbody: null,
    drainage_area: null,
    usgs_id: null,
    noaa_id: null,
    other_id: null,
    safety_notes: null,
    zone: null,
    address: null,
    city: null,
    state: null,
    county: null,
    zip: null,
    memberName: null,
    priority_id: null,
  };

  public landownerContact = {
    lname: null,
    fname: null,
    title: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    primaryphone: null,
    secondaryphone: null,
    email: null,
  }

  siteForm;
  landownerForm;
  siteFileForm;

  public hasLandownerContact = false;
  public addLandownerCheck = false;
  public useSiteAddress = false;
  public showFileForm = false;
  public incorrectDMS = false;
  public isDisabled = false;
  public permHousingDisabled = false;
  public fileItemExists = false;
  
  displayedColumns: string[] = [
    'HousingType',
    'HousingLength',
    'HousingMaterial',
    'Amount',
    'Notes',
  ];

  displayedFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  constructor(
    private dialogRef: MatDialogRef<SiteEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
    public siteEditService: SiteEditService,
    private changeDetector : ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.hDatums = this.data.hdatumList;
    this.hMethods = this.data.hmethodList;
    this.getNetworkTypes();
    this.getNetworkNames();
    this.getAgencies();
    this.getFileTypes();
    this.getPriorities();
    this.setInitialSite();
    this.getSiteHousings();
    this.initSiteForm();
    this.initLandownerForm();
    this.initSiteFileForm();
  }

  getNetworkTypes() {
    let self = this;
    this.siteService.getNetworkTypesList().subscribe((results) => {
      results.forEach(function(result){
        if (self.data.networkType !== undefined && self.data.networkType.includes(result.network_type_name)){
          result.selected = true;
          self.selectedNetworkTypes.push(result.network_type_name)
          self.siteForm.controls.networkType.push(new FormControl(result.network_type_name));
        }else{
          result.selected = false;
        }
      })
      this.networkTypes = results;
    });
  }

  getNetworkNames() {
    let self = this;
    this.siteService.getNetworkNamesList().subscribe((results) => {
      results.forEach(function(result){
        if (self.data.networkName !== undefined && self.data.networkName.includes(result.name)){
          result.selected = true;
          self.selectedNetworkNames.push(result.name);
          if(result.name === "Not Defined"){
            this.isDisabled = true;
          }
          self.siteForm.controls.networkName.push(new FormControl(result.name));
        }else{
          result.selected = false;
        }
      })
      this.networkNames = results;
      // Disable and deselect other checkboxes if Not Defined
      if(this.isDisabled == true){
        this.siteForm.controls.networkName.clear();
        this.selectedNetworkNames = ["Not Defined"];
        this.siteForm.controls.networkName.push(new FormControl("Not Defined"));

        this.networkNames.forEach(function(name){
          if (name.name !== "Not Defined"){
            name.selected = false;
          }
        })
      }
    });
  }

  getAgencies() {
    this.siteService.getAgencyLookup().subscribe((results) => {
      this.agencies = results;
    });
  }

  getPriorities() {
    this.siteService.getPriorities().subscribe((results) => {
      this.priorityList = results;
    });
  }

  getFileTypes() {
    let self = this;
    this.siteService.getFileTypeLookup().subscribe((results) => {
      results.forEach(function(results){
        if (results.filetype !== 'Data' && results.filetype !== 'NGS Datasheet'){
          self.fileTypes.push(results);
        }
      })
    });
  }

  getSiteHousings() {
    this.siteService.getAllHousingTypes().subscribe((results) => {
      this.siteHousingLookup = results;
    });
  }

  setSelectedNetworkType(event, data) {
    data.selected = event.checked;
    let self = this;
    // Add to or remove from form array to submit
    if(data.selected && !(this.selectedNetworkTypes.join(',').includes(data.network_type_name))){
      this.selectedNetworkTypes.push(data.network_type_name);
      this.siteForm.controls.networkType.push(new FormControl(data.network_type_name));
    }else if(!data.selected && (this.selectedNetworkTypes.join(',').includes(data.network_type_name))){
      this.selectedNetworkTypes.splice(this.selectedNetworkTypes.indexOf(data.network_type_name), 1)
      this.siteForm.controls.networkType.controls.forEach(function(control, i){
        if(control.value === data.network_type_name){
          self.siteForm.controls.networkType.removeAt(i);
        }
      });
    }
  }

  setSelectedNetworkName(event, data) {
    data.selected = event.checked;
    let self = this;
    // Add to or remove from form array to submit
    if(data.selected && !(this.selectedNetworkNames.join(',').includes(data.name))){
      this.selectedNetworkNames.push(data.name);
      this.siteForm.controls.networkName.push(new FormControl(data.name));
    }else if(!data.selected && (this.selectedNetworkNames.join(',').includes(data.name))){
      this.selectedNetworkNames.splice(this.selectedNetworkNames.indexOf(data.name), 1)
      this.siteForm.controls.networkName.controls.forEach(function(control, i){
        if(control.value === data.name){
          self.siteForm.controls.networkName.removeAt(i);
        }
      });
    }
    // Disable other checkboxes if undefined is checked
    if(data.selected && data.name === "Not Defined"){
      this.isDisabled = true;
      this.siteForm.controls.networkName.clear();
      this.selectedNetworkNames = [data.name];
      this.siteForm.controls.networkName.push(new FormControl(data.name));
      this.networkNames.forEach(function(name){
        if (name.name !== data.name){
          name.selected = false;
        }
      })
    }else{
      this.isDisabled = false;
    }
  }

  changeTableValue(value){
    let newObject = {
      amount: null,
      housingType: null,
      length: null,
      material: null,
      notes: null,
    }
    let self = this;
    // If no housing types, only 1 value exists
    if(this.siteHousingArray.length === 0){
      newObject.housingType = value[0];
      // Add to housing table array
      this.siteHousingArray.push(newObject);
      // Populate the dropdown value
      this.housingTypeArray.push(value[0]);
    // Compare with existing housing types in table
    }else{
      value.forEach(function(type){
        if(!self.housingTypeArray.join(',').includes(type)){
          newObject.housingType = type;
          self.housingTypeArray.push(type);
          self.siteHousingArray.push(newObject);
        }
      })
      this.housingTypeArray.forEach(function(type){
        if(!value.join(',').includes(type)){
          self.housingTypeArray.splice(self.housingTypeArray.indexOf(type), 1);
          self.siteHousingArray.forEach(function(housing){
            if(housing.housingType === type){
              self.siteHousingArray.splice(self.siteHousingArray.indexOf(housing), 1);
            }
          })
        }
      })
    }
    this.siteForm.controls['housingType'].setValue(this.housingTypeArray);
    this.siteHousingArray = [...this.siteHousingArray];
  }

  // Populate site info initially with existing site info
  setInitialSite() {
    let self = this;
    this.site.description =  this.data.site.site_description !== undefined && this.data.site.site_description !== "" ? this.data.site.site_description : null;
    this.site.latitude_dd = this.data.site.latitude_dd !== undefined && this.data.site.latitude_dd !== "" ? this.data.site.latitude_dd : null;
    this.site.longitude_dd = this.data.site.longitude_dd !== undefined && this.data.site.longitude_dd !== "" ? this.data.site.longitude_dd : null;
    this.site.hdatum = this.data.hdatum !== undefined && this.data.hdatum !== "" ? this.data.hdatum : null;
    this.site.hmethod = this.data.hmethod !== undefined && this.data.hmethod !== "" ? this.data.hmethod : null;
    this.site.waterbody = this.data.site.waterbody !== undefined && this.data.site.waterbody !== "" ? this.data.site.waterbody : null;
    this.site.safety_notes = this.data.site.safety_notes !== undefined && this.data.site.safety_notes !== "" ? this.data.site.safety_notes : null;
    this.site.zone = this.data.site.zone !== undefined && this.data.site.zone !== "" ? this.data.site.zone : null;
    this.site.usgs_id = this.data.site.usgs_sid !== undefined && this.data.site.usgs_sid !== "" ? this.data.site.usgs_sid : null;
    this.site.noaa_id = this.data.site.noaa_sid !== undefined && this.data.site.noaa_sid !== "" ? this.data.site.noaa_sid : null;
    this.site.other_id = this.data.site.other_sid !== undefined && this.data.site.other_sid !== "" ? this.data.site.other_sid : null;
    this.site.internal_notes = this.data.site.site_notes !== undefined && this.data.site.site_notes !== "" ? this.data.site.site_notes : null;
    this.site.drainage_area = this.data.site.drainage_area_sqmi !== undefined && this.data.site.drainage_area_sqmi !== "" ? this.data.site.drainage_area_sqmi : null;
    this.site.address = this.data.site.address !== undefined && this.data.site.address !== "" ? this.data.site.address : null;
    this.site.county = this.data.site.county !== undefined && this.data.site.county !== "" ? this.data.site.county : null;
    this.site.city = this.data.site.city !== undefined && this.data.site.city !== "" ? this.data.site.city : null;
    this.site.zip = this.data.site.zip !== undefined && this.data.site.zip !== "" ? this.data.site.zip : null;
    this.site.memberName = this.data.memberName !== undefined && this.data.memberName !== "---" && this.data.memberName !== "" ? this.data.memberName : null;
    this.hasLandownerContact = this.data.site.landownercontact_id !== undefined && this.data.site.landownercontact_id !== "---" && this.data.site.landownercontact_id !== "" ? true : null;
    this.landownerContact = this.data.landowner !== "" && this.data.landowner !== undefined && this.data.landowner !== null ? this.data.landowner : this.landownerContact;
    this.data.siteHousing.forEach(function(type){
      self.siteHousingArray.push(type);
      self.housingTypeArray.push(type.housingType);
    });
    this.initSiteFiles = this.data.siteFiles;
    this.priority = this.data.priority !== undefined && this.data.priority !== null ? this.data.priority : {priority_id: null};
    
    this.perm_housing_installed = this.data.site.is_permanent_housing_installed !== undefined && this.data.site.is_permanent_housing_installed === "Yes" ? "Yes" : "No";
    this.sensorNotAppropriate = this.data.site.sensor_not_appropriate !== undefined && this.sensorNotAppropriate === 1 ? true : false;
    if(this.sensorNotAppropriate){
      this.permHousingDisabled = true;
    }
    if (this.data.site.access_granted !== undefined){
      if(this.data.site.access_granted === "Yes"){
        this.accessGranted = "Yes";
      } else if(this.data.site.access_granted === "No"){
        this.accessGranted = "No";
      } else{
        this.accessGranted = "Not Needed";
      }
    }
    this.getStateList();
  }

  getStateList() {
    let self = this;
    this.siteService.getAllStates().subscribe((results) => {
      this.stateList = results;
      if(this.data.site.state !== undefined && this.data.site.state !== ""){
        this.stateList.forEach(function(state){
          if(state.state_abbrev === self.data.site.state){
            self.site.state = state.state_name;
            self.getCountyList(self.site.state);
            self.siteForm.controls['state'].setValue(self.site.state);
          }
        });
      }
    });
  }

  getCountyList(stateName) {
      let self = this;
      let stateID;
      this.stateList.forEach(function(state){
        if(stateName === state.state_name){
          stateID = state.state_id;
          self.siteService.getAllCounties(stateID).subscribe((results) => {
            self.countyList = results;
          });
          if(stateName !== self.site.state){
            self.site.county = null;
            self.siteForm.controls['county'].setValue(self.site.county);
          }
        }
      })
  }

  addLandownerContact() {
    this.addLandownerCheck = true;
  }

  deleteLandowner() {
    this.addLandownerCheck = false;
  }

  initLandownerForm() {
    this.landownerForm = new FormGroup({
      fname: new FormControl(this.landownerContact.fname, Validators.required),
      lname: new FormControl(this.landownerContact.lname),
      title: new FormControl(this.landownerContact.title),
      address: new FormControl(this.landownerContact.address),
      city: new FormControl(this.landownerContact.city),
      state: new FormControl(this.landownerContact.state),
      zip: new FormControl(this.landownerContact.zip),
      email: new FormControl(this.landownerContact.email),
      primaryphone: new FormControl(this.landownerContact.primaryphone),
      secondaryphone: new FormControl(this.landownerContact.secondaryphone),
    })
  }

  useAddressforLO() {
    this.useSiteAddress = !this.useSiteAddress;
    if (this.useSiteAddress) {
      this.landownerContact.address = this.site.address;
      this.landownerContact.city = this.site.city;
      this.landownerContact.state = this.site.state;
      this.landownerContact.zip = this.site.zip;
      this.landownerForm.controls['address'].setValue(this.landownerContact.address);
      this.landownerForm.controls['city'].setValue(this.landownerContact.city);
      this.landownerForm.controls['state'].setValue(this.landownerContact.state);
      this.landownerForm.controls['zip'].setValue(this.landownerContact.zip);
    } else {
      this.landownerContact.address = "";
      this.landownerContact.city = "";
      this.landownerContact.state = "";
      this.landownerContact.zip = "";
      this.landownerForm.controls['address'].setValue(this.landownerContact.address);
      this.landownerForm.controls['city'].setValue(this.landownerContact.city);
      this.landownerForm.controls['state'].setValue(this.landownerContact.state);
      this.landownerForm.controls['zip'].setValue(this.landownerContact.zip);

    }
  }

  addSiteFile() {
    // Reset form
    this.cancelFile();
    this.showFileForm = true;
    this.addFileType = "New";
  }

  getFileTypeSelection(event) {
    this.siteFiles.filetype_id = event.value;
  }

  initSiteForm() {
    this.siteForm = new FormGroup({
      site_description: new FormControl(this.site.description, Validators.required),
      site_notes: new FormControl(this.site.internal_notes),
      latitude_dd: new FormControl(this.site.latitude_dd),
      longitude_dd: new FormControl(this.site.longitude_dd),
      is_permanent_housing_installed: new FormControl({value: this.perm_housing_installed, disabled: this.permHousingDisabled}),
      access_granted: new FormControl(this.accessGranted),
      hdatum: new FormControl(this.site.hdatum, Validators.required),
      hmethod: new FormControl(this.site.hmethod, Validators.required),
      waterbody: new FormControl(this.site.waterbody, Validators.required),
      drainage_area_sqmi: new FormControl(this.site.drainage_area),
      usgs_sid: new FormControl(this.site.usgs_id),
      noaa_sid: new FormControl(this.site.noaa_id),
      other_sid: new FormControl(this.site.other_id),
      safety_notes: new FormControl(this.site.safety_notes),
      zone: new FormControl(this.site.zone),
      address: new FormControl(this.site.address),
      city: new FormControl(this.site.city),
      state: new FormControl(this.site.state, Validators.required),
      county: new FormControl(this.site.county, Validators.required),
      zip: new FormControl(this.site.zip),
      housingType: new FormControl(this.housingTypeArray),
      priority_id: new FormControl(this.priority.priority_id),
      latdeg: new FormControl(this.dms.latdeg),
      latmin: new FormControl(this.dms.latmin),
      latsec: new FormControl(this.dms.latsec),
      londeg: new FormControl(this.dms.londeg),
      lonmin: new FormControl(this.dms.lonmin),
      lonsec: new FormControl(this.dms.lonsec),
      networkType: new FormArray([]),
      networkName: new FormArray([]),
      landownercontact_id: new FormControl(),
    });

    this.setLatLngValidators();
  }

  setLatLngValidators() {
    if (this.latLngUnit === "dms"){
      this.siteForm.controls.latdeg.setValidators([Validators.required, this.checkDDLatDegValue()]);
      this.siteForm.controls.latmin.setValidators([Validators.required, this.checkDDLatMinValue()]);
      this.siteForm.controls.latsec.setValidators([Validators.required, this.checkDDLatSecValue()]);
      this.siteForm.controls.londeg.setValidators([Validators.required, this.checkDDLonDegValue()]);
      this.siteForm.controls.lonmin.setValidators([Validators.required, this.checkDDLonMinValue()]);
      this.siteForm.controls.lonsec.setValidators([Validators.required, this.checkDDLonSecValue()]);
      this.siteForm.controls.latitude_dd.setValidators();
      this.siteForm.controls.longitude_dd.setValidators();
    }else{
      this.siteForm.controls.latitude_dd.setValidators([Validators.required, this.checkLatValue()]);
      this.siteForm.controls.longitude_dd.setValidators([Validators.required, this.checkLonValue()]);
      this.siteForm.controls.latdeg.setValidators();
      this.siteForm.controls.latmin.setValidators();
      this.siteForm.controls.latsec.setValidators();
      this.siteForm.controls.londeg.setValidators();
      this.siteForm.controls.lonmin.setValidators();
      this.siteForm.controls.lonsec.setValidators();
    }
  }

  range = function (x, min, max) {
    return x < min || x > max;
  }

  checkNaN = function(x){
    return isNaN(x);
  }

  initSiteFileForm() {
    this.siteFileForm = new FormGroup({
      File: new FormControl(),
      file_id: new FormControl(this.siteFiles.file_id),
      name: new FormControl(this.siteFiles.name),
      FULLname: new FormControl(this.siteFiles.FULLname, Validators.required),
      description: new FormControl(this.siteFiles.description, Validators.required),
      file_date: new FormControl(this.siteFiles.file_date, Validators.required),
      photo_date: new FormControl(this.siteFiles.photo_date, Validators.required),
      agency_id: new FormControl(this.siteFiles.agency_id, Validators.required),
      site_id: new FormControl(this.siteFiles.site_id),
      filetype_id: new FormControl(this.siteFiles.filetype_id, Validators.required),
      path: new FormControl(this.siteFiles.path),
      data_file_id: new FormControl(this.siteFiles.data_file_id),
      instrument_id: new FormControl(this.siteFiles.instrument_id),
      last_updated: new FormControl(this.siteFiles.last_updated),
      last_updated_by: new FormControl(this.siteFiles.last_updated_by),
      site_description: new FormControl(this.siteFiles.site_description),
      photo_direction: new FormControl(this.siteFiles.photo_direction),
      latitude_dd: new FormControl(this.siteFiles.latitude_dd, [this.checkLatValue()]),
      longitude_dd: new FormControl(this.siteFiles.longitude_dd, [this.checkLonValue()]),
    })
  }

  formatDate(event){
    this.formattedPhotoDate = (event.value.getMonth() + 1) + '/' + event.value.getDate() + '/' + event.value.getFullYear();
  }

  changeLatLngUnit(event) {
    this.setLatLngValidators();
    if (event.value == "decdeg") {
        this.latLngUnit = "decdeg";
        //they clicked Dec Deg..
        if ((this.siteForm.controls.latdeg.value !== undefined && this.siteForm.controls.latmin.value !== undefined && this.siteForm.controls.latsec.value !== undefined) &&
            (this.siteForm.controls.londeg.value !== undefined && this.siteForm.controls.lonmin.value !== undefined && this.siteForm.controls.lonsec.value !== undefined)) {
            //convert what's here for each lat and long
            this.siteForm.controls['latitude_dd'].setValue(this.azimuth(this.siteForm.controls.latdeg.value, this.siteForm.controls.latmin.value, this.siteForm.controls.latsec.value));
            this.siteForm.controls['longitude_dd'].setValue(this.azimuth(this.siteForm.controls.londeg.value, this.siteForm.controls.lonmin.value, this.siteForm.controls.lonsec.value));
            this.incorrectDMS = false;
        } else {
            //show card telling them to populate all three (DMS) for conversion to work
            this.incorrectDMS = true;
        }
    } else {
        this.latLngUnit = "dms"
        //they clicked dms (convert lat/long to dms)
        if (this.siteForm.controls.latitude_dd.value !== undefined && this.siteForm.controls.longitude_dd.value !== undefined) {
            var latDMS = (this.deg_to_dms(this.siteForm.controls.latitude_dd.value)).toString();
            var ladDMSarray = latDMS.split(':');
            this.siteForm.controls['latdeg'].setValue(ladDMSarray[0]);
            this.siteForm.controls['latmin'].setValue(ladDMSarray[1]);
            this.siteForm.controls['latsec'].setValue(ladDMSarray[2]);

            var longDMS = this.deg_to_dms(this.siteForm.controls.longitude_dd.value);
            var longDMSarray = longDMS.split(':');
            this.siteForm.controls['londeg'].setValue(-(longDMSarray[0]));
            this.siteForm.controls['lonmin'].setValue(longDMSarray[1]);
            this.siteForm.controls['lonsec'].setValue(longDMSarray[2]);
        }
    }
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
      const incorrect = this.range(control.value, -175, -60) || this.checkNaN(control.value);
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

  updateAgencyForCaption(event) {
    let self = this;
    if (this.siteFileForm.controls['filetype_id'].value == 1)
        this.agencyNameForCap = this.agencies.filter(function (a) { return a.agency_id == self.siteFileForm.controls['agency_id'].value; })[0].agency_name;
  }

  sensorAppropriateChanged(event){
    if(event.checked){
      this.perm_housing_installed = "No";
      this.siteForm.controls['is_permanent_housing_installed'].setValue(this.perm_housing_installed);
      this.siteForm.controls['is_permanent_housing_installed'].disable();

    }else{
      this.siteForm.controls['is_permanent_housing_installed'].enable();
    }
  }

  showFileEdit(row) {
    // Reset form
    this.cancelFile();
    this.setInitFileEditForm(row);
    this.showFileForm = true;
    this.siteFiles.file_id = row.file_id;
    this.siteFiles.filetype_id = row.filetype_id;
    this.addFileType = "Existing";

    this.getFile();
  }

  setInitFileEditForm(data) {
    this.siteFileForm.controls['file_id'].setValue(data.file_id);
    this.siteFileForm.controls['name'].setValue(data.name);
    this.siteFileForm.controls['FULLname'].setValue(data.FULLname);
    this.siteFileForm.controls['description'].setValue(data.description);
    this.siteFileForm.controls['file_date'].setValue(data.file_date);
    this.siteFileForm.controls['photo_date'].setValue(data.photo_date);
    this.siteFileForm.controls['agency_id'].setValue(data.agency_id);
    this.siteFileForm.controls['site_id'].setValue(data.site_id);
    this.siteFileForm.controls['filetype_id'].setValue(data.filetype_id);
    this.siteFileForm.controls['path'].setValue(data.path);
    this.siteFileForm.controls['instrument_id'].setValue(data.instrument_id);
    this.siteFileForm.controls['last_updated'].setValue(data.last_updated);
    this.siteFileForm.controls['last_updated_by'].setValue(data.last_updated_by);
    this.siteFileForm.controls['site_description'].setValue(data.site_description);
    this.siteFileForm.controls['photo_direction'].setValue(data.photo_direction);
    this.siteFileForm.controls['latitude_dd'].setValue(data.latitude_dd);
    this.siteFileForm.controls['longitude_dd'].setValue(data.longitude_dd);
  }

  getFile() {
    if(this.siteFiles.file_id !== null && this.siteFiles.file_id !== undefined){
      this.siteService.getFileItem(this.siteFiles.file_id).subscribe((results) => {
        console.log(results)
        if(results.FileName !== undefined) {
          this.fileItemExists = true;
          this.fileSource = APP_SETTINGS.API_ROOT + 'Files/' + this.siteFiles.file_id + '/item';
        }else{
          this.fileItemExists = false;
        }
      });
    }else{
      this.fileItemExists = false;
    }
  }

  saveFileUpload(event) {
    console.log(event)
  }

  cancelFile() {
    // Reset file inputs
    this.changeDetector.detectChanges();
    console.log(this.upload)
    if(this.upload !== undefined){
      this.upload.nativeElement.value = '';
    }

    this.showFileForm = false;

    this.siteFileForm.reset();

    // this.existingFile = {
    //   file_id: null,
    //   filetype_id: null,
    // }

    this.siteFiles = {
      file_id: null,
      name: null,
      FULLname: null,
      description: null,
      file_date: null,
      photo_date: null,
      agency_id: null,
      site_id: null,
      filetype_id: null,
      path: null,
      data_file_id: null,
      instrument_id: null,
      last_updated: null,
      last_updated_by: null,
      site_description: null,
      photo_direction: null,
      latitude_dd: null,
      longitude_dd: null,
    };
  }

  submitSiteForm(){
    this.siteForm.markAllAsTouched();
    if(this.siteForm.valid){
      this.valid = true;
      // Post landowner if added
      if(this.addLandownerCheck){
        if(this.landownerForm.valid){
          this.landownerValid = true;
          console.log(this.landownerForm.value)
          this.siteEditService.putLandowner(this.landownerForm.value).subscribe((response) => {
            console.log(response);
            this.putSite();
            this.dialogRef.close();
          })
        }else{
          this.landownerValid = false;
          this.putSite();
          alert("Error creating landowner contact.")
          this.dialogRef.close();
        }
      }
      else{
        this.putSite();
        this.dialogRef.close();
      }
      // Close dialog
    }else{
      this.valid = false;
      alert("Some required site fields are missing or incorrect.  Please fix these fields before submitting.")
    }

    // date updated
  }

  putSite() {
    // Convert dms to dd
    if(this.latLngUnit === "dms"){
      this.siteForm.controls['latitude_dd'].setValue(this.azimuth(this.siteForm.controls.latdeg.value, this.siteForm.controls.latmin.value, this.siteForm.controls.latsec.value));
      this.siteForm.controls['longitude_dd'].setValue(this.azimuth(this.siteForm.controls.londeg.value, this.siteForm.controls.lonmin.value, this.siteForm.controls.lonsec.value));
    }
    // Copy form value object and delete extra fields
    let siteSubmission = JSON.parse(JSON.stringify(this.siteForm.value));
    delete siteSubmission.latdeg; delete siteSubmission.latmin; delete siteSubmission.latsec; delete siteSubmission.londeg; delete siteSubmission.lonmin; delete siteSubmission.lonsec;
    
    console.log(siteSubmission);
    console.log(this.siteForm.value);

    // this.siteEditService.submitForm(this.siteForm.value)
    //   .subscribe(
    //       (data) => {
    //           console.log('Form submitted successfully'); 
    //           console.log(data)                          
    //       },
    //       (error: HttpErrorResponse) => {
    //           console.log(error);
    //       }
    //   );

    // create list of housing types, network names and network types to remove
    // Delete housing info
    // Delete netowrk type info
    // delete network names
    // Insert housing info
    // Insert Network type and network name
    // Insert hdatum and hcollection method info
    // Insert priority info
  }

  saveFile() {
    this.siteFileForm.markAllAsTouched();
    if(this.siteFileForm.valid){
      this.fileValid = true;
      console.log(this.siteFileForm.value)
    }else{
      this.fileValid = false;
      alert("Some required site file fields are missing or incorrect.  Please fix these fields before submitting.")
    }
  }

  deleteFile() {

  }

  createFile() {
    this.siteFileForm.markAllAsTouched();
    if(this.siteFileForm.valid){
      this.fileValid = true;
      console.log(this.siteFileForm.value)
    }else{
      this.fileValid = false;
      alert("Some required site file fields are missing or incorrect.  Please fix these fields before submitting.")
    }
  }
}
