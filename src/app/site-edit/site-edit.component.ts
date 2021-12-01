import { L } from '@angular/cdk/keycodes';
import { GlobalPositionStrategy } from '@angular/cdk/overlay';
import { ConditionalExpr } from '@angular/compiler';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NetworkNameService } from '@app/services/network-name.service';
import { SiteEditService } from '@app/services/site-edit.service';
import { SiteService } from '@app/services/site.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
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
  public fileUploading;
  public dms = {
    latdeg: null,
    latmin: null,
    latsec: null,
    londeg: null,
    lonmin: null,
    lonsec: null,
  }
  public siteFiles = {
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
      data_file_id: null,
      instrument_id: null,
      last_updated: null,
      last_updated_by: null,
      site_description: null,
      photo_direction: null,
      latitude_dd: null,
      longitude_dd: null,
    },
    File: null
  };
  public site = {
    description: null,
    internal_notes: null,
    latitude_dd: null,
    longitude_dd: null,
    hdatum_id: null,
    hcollect_method_id: null,
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
    landownercontactid: null,
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
        if (self.data.networkType !== undefined && self.data.networkType !== null && self.data.networkType.includes(result.network_type_name)){
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
        if (self.data.networkName !== undefined && self.data.networkName !== null && self.data.networkName.includes(result.name)){
          result.selected = true;
          self.selectedNetworkNames.push(result.name);
          if(result.name === "Not Defined"){
            self.isDisabled = true;
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
        }else{
          name.selected = true;
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
      housing_type_id: null,
      site_housing_id: null,
    }
    let self = this;
    // If no housing types, only 1 value exists
    if(this.siteHousingArray.length === 0){
      newObject.housingType = value[0];
      this.siteHousingLookup.forEach(function(housingType){
        if(housingType.type_name === value[0]){
          newObject.housing_type_id = housingType.housing_type_id;
        }
      });
      this.data.siteHousing.forEach(function(siteHousing){
        if(siteHousing.housingType !== null && siteHousing.housingType === value[0].housingType){
          newObject.site_housing_id = siteHousing.site_housing_id;
        }
      });
      // Add to housing table array
      this.siteHousingArray.push(newObject);
      // Populate the dropdown value
      this.housingTypeArray.push(value[0]);
    // Compare with existing housing types in table
    }else{
      value.forEach(function(type){
        if(!self.housingTypeArray.join(',').includes(type)){
          newObject.housingType = type;
          self.siteHousingLookup.forEach(function(housingType){
            if(housingType.type_name === type){
              newObject.housing_type_id = housingType.housing_type_id;
            }
            self.data.siteHousing.forEach(function(siteHousing){
              if(siteHousing.housingType !== null && siteHousing.housingType === type){
                newObject.site_housing_id = siteHousing.site_housing_id;
              }
            });
          })
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
    this.siteForm.controls["siteHousings"] = new FormArray(this.siteHousingArray.map((housing, index) => new FormGroup(this.createHousingArray(housing))));
  }

  // Populate site info initially with existing site info
  setInitialSite() {
    let self = this;
    this.site.description =  this.data.site.site_description !== undefined && this.data.site.site_description !== "" ? this.data.site.site_description : null;
    this.site.latitude_dd = this.data.site.latitude_dd !== undefined && this.data.site.latitude_dd !== "" ? this.data.site.latitude_dd : null;
    this.site.longitude_dd = this.data.site.longitude_dd !== undefined && this.data.site.longitude_dd !== "" ? this.data.site.longitude_dd : null;
    this.site.hdatum_id = this.data.site.hdatum_id !== undefined && this.data.site.hdatum_id !== "" ? this.data.site.hdatum_id : null;
    this.site.hcollect_method_id = this.data.site.hcollect_method_id !== undefined && this.data.site.hcollect_method_id !== "" ? this.data.site.hcollect_method_id : null;
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
    this.landownerContact = this.data.landowner !== "" && this.data.landowner !== undefined && this.data.landowner !== null ? JSON.parse(JSON.stringify(this.data.landowner)) : this.landownerContact;
    this.addLandownerCheck = this.data.landowner !== "" && this.data.landowner !== undefined && this.data.landowner !== null ? true: false;
    this.data.siteHousing.forEach(function(type){
      if(type.housingType !== null){
        self.siteHousingArray.push(type);
        self.housingTypeArray.push(type.housingType);
      }
    });
    this.initSiteFiles = this.data.siteFiles;
    this.priority = this.data.priority !== undefined && this.data.priority !== null ? this.data.priority : {priority_id: null};
    
    this.perm_housing_installed = this.data.site.is_permanent_housing_installed !== undefined && this.data.site.is_permanent_housing_installed === "Yes" ? "Yes" : "No";
    this.sensorNotAppropriate = this.data.site.sensor_not_appropriate !== undefined && this.sensorNotAppropriate === 1 ? 1 : null;
    if(this.sensorNotAppropriate === 1){
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
            self.getCountyList(state.state_abbrev);
            self.siteForm.controls['state'].setValue(state.state_abbrev);
          }
        });
      }
    });
  }

  getCountyList(stateName) {
      let self = this;
      let stateID;
      this.stateList.forEach(function(state){
        if(stateName === state.state_abbrev){
          stateID = state.state_id;
          self.siteService.getAllCounties(stateID).subscribe((results) => {
            self.countyList = results;
          });
          if(state.state_name !== self.site.state){
            self.site.county = null;
            self.siteForm.controls['county'].setValue(self.site.county);
          }
        }
      })

      this.updateLOAddress();
  }

  updateLOAddress() {
    if(this.addLandownerCheck && this.useSiteAddress) {
      this.landownerContact.address = this.site.address;
      this.landownerContact.city = this.site.city;
      this.landownerContact.state = this.site.state;
      this.landownerContact.zip = this.site.zip;
      this.landownerForm.controls['address'].setValue(this.landownerContact.address);
      this.landownerForm.controls['city'].setValue(this.landownerContact.city);
      this.landownerForm.controls['state'].setValue(this.landownerContact.state);
      this.landownerForm.controls['zip'].setValue(this.landownerContact.zip);
    }
  }

  addLandownerContact() {
    this.addLandownerCheck = true;
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
      landownercontact_id: new FormControl(this.landownerContact.landownercontactid)
    })
  }

  useAddressforLO() {
    this.landownerForm.markAsDirty();
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
    this.siteFiles.FileEntity.filetype_id = event.value;
  }

  initSiteForm() {
    console.log(this.data.site.site_id)
    this.siteForm = new FormGroup({
      site_description: new FormControl(this.site.description, Validators.required),
      site_notes: new FormControl(this.site.internal_notes),
      site_name: new FormControl(this.data.site.site_name),
      site_id: new FormControl(this.data.site.site_id),
      site_no: new FormControl(this.data.site.site_no),
      latitude_dd: new FormControl(this.site.latitude_dd),
      longitude_dd: new FormControl(this.site.longitude_dd),
      is_permanent_housing_installed: new FormControl({value: this.perm_housing_installed, disabled: this.permHousingDisabled}),
      access_granted: new FormControl(this.accessGranted),
      hdatum_id: new FormControl(this.site.hdatum_id, Validators.required),
      hcollect_method_id: new FormControl(this.site.hcollect_method_id, Validators.required),
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
      // siteHousings: new FormControl(this.siteHousingArray),
      siteHousings: new FormArray(this.siteHousingArray.map((housing, index) => new FormGroup(this.createHousingArray(housing)))),
      priority_id: new FormControl(this.priority.priority_id),
      latdeg: new FormControl(this.dms.latdeg),
      latmin: new FormControl(this.dms.latmin),
      latsec: new FormControl(this.dms.latsec),
      londeg: new FormControl(this.dms.londeg),
      lonmin: new FormControl(this.dms.lonmin),
      lonsec: new FormControl(this.dms.lonsec),
      networkType: new FormArray([]),
      networkName: new FormArray([]),
      hwms: new FormControl([]),
      instruments: new FormControl([]),
      files: new FormControl([]),
      objective_points: new FormControl([]),
      site_housing: new FormControl([]),
      network_type_site: new FormControl([]),
      network_name_site: new FormControl([]),
      landownercontact_id: new FormControl(),
      member_id: new FormControl(this.data.site.member_id),
      sensor_not_appropriate: new FormControl(this.sensorNotAppropriate),
    });

    this.setLatLngValidators();
  }

  createHousingArray(housing) {
    return {
      housingType: new FormControl({value: housing ? housing.housingType : null,  disabled: true}),
      amount: new FormControl(housing ? housing.amount : null),
      length: new FormControl(housing ? housing.length : null),
      material: new FormControl(housing ? housing.material : null),
      notes: new FormControl(housing ? housing.notes : null),
      housing_type_id: new FormControl(housing ? housing.housing_type_id : null),
      site_id: new FormControl(this.data.site.site_id),
      site_housing_id: new FormControl(housing ? housing.site_housing_id : null),
    } as FormArray["value"];
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
    console.log(x, min, max);
    return x < min || x > max;
  }

  checkNaN = function(x){
    return isNaN(x);
  }

  initSiteFileForm() {
    console.log(this.siteFiles.FileEntity)
    this.siteFileForm = new FormGroup({
      File: new FormControl(this.siteFiles.File),
      file_id: new FormControl(this.siteFiles.FileEntity.file_id),
      name: new FormControl(this.siteFiles.FileEntity.name),
      FULLname: new FormControl(this.siteFiles.FileEntity.FULLname, Validators.required),
      source_id: new FormControl(this.siteFiles.FileEntity.source_id),
      description: new FormControl(this.siteFiles.FileEntity.description, Validators.required),
      file_date: new FormControl(this.siteFiles.FileEntity.file_date, Validators.required),
      photo_date: new FormControl(this.siteFiles.FileEntity.photo_date, Validators.required),
      agency_id: new FormControl(this.siteFiles.FileEntity.agency_id, Validators.required),
      site_id: new FormControl(this.siteFiles.FileEntity.site_id),
      filetype_id: new FormControl(this.siteFiles.FileEntity.filetype_id, Validators.required),
      path: new FormControl(this.siteFiles.FileEntity.path),
      data_file_id: new FormControl(this.siteFiles.FileEntity.data_file_id),
      instrument_id: new FormControl(this.siteFiles.FileEntity.instrument_id),
      last_updated: new FormControl(this.siteFiles.FileEntity.last_updated),
      last_updated_by: new FormControl(this.siteFiles.FileEntity.last_updated_by),
      site_description: new FormControl(this.siteFiles.FileEntity.site_description),
      photo_direction: new FormControl(this.siteFiles.FileEntity.photo_direction),
      latitude_dd: new FormControl(this.siteFiles.FileEntity.latitude_dd, [this.checkLatValue()]),
      longitude_dd: new FormControl(this.siteFiles.FileEntity.longitude_dd, [this.checkLonValue()]),
      hwm_id: new FormControl(null),
      is_nwis: new FormControl(null),
      objective_point_id: new FormControl(null),
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

  updateAgencyForCaption() {
    let self = this;
    if (this.siteFileForm.controls['filetype_id'].value == 1)
        this.agencyNameForCap = this.agencies.filter(function (a) { return a.agency_id == self.siteFileForm.controls['agency_id'].value; })[0].agency_name;
  }

  sensorAppropriateChanged(event){
    if(event.checked){
      this.sensorNotAppropriate = 1;
      this.siteForm.controls["sensor_not_appropriate"].setValue(this.sensorNotAppropriate);
      this.perm_housing_installed = "No";
      this.siteForm.controls['is_permanent_housing_installed'].setValue(this.perm_housing_installed);
      this.siteForm.controls['is_permanent_housing_installed'].disable();

    }else{
      this.sensorNotAppropriate = null;
      this.siteForm.controls["sensor_not_appropriate"].setValue(this.sensorNotAppropriate);
      this.siteForm.controls['is_permanent_housing_installed'].enable();
    }
  }

  showFileEdit(row) {
    // Reset form
    this.cancelFile();
    this.setInitFileEditForm(row);
    this.showFileForm = true;
    this.siteFiles.FileEntity.file_id = row.file_id;
    this.siteFiles.FileEntity.filetype_id = row.filetype_id;
    this.addFileType = "Existing";
    this.siteFiles.FileEntity.source_id = row.source_id;
    this.siteFiles.FileEntity.file_date = row.file_date;
    this.siteFiles.FileEntity.photo_date = row.photo_date !== undefined ? row.photo_date : null;
    this.siteFiles.FileEntity.photo_direction = row.photo_direction !== undefined && row.photo_direction !== "" ? row.photo_direction : null;
    this.siteFiles.FileEntity.latitude_dd = row.latitude_dd !== undefined && row.latitude_dd !== "" ? row.latitude_dd : null;
    this.siteFiles.FileEntity.longitude_dd = row.longitude_dd !== undefined && row.longitude_dd !== "" ? row.longitude_dd : null;
    
    this.siteFileForm.controls['file_date'].setValue(this.siteFiles.FileEntity.file_date);
    this.siteFileForm.controls['photo_date'].setValue(this.siteFiles.FileEntity.photo_date);
    this.siteFileForm.controls['file_id'].setValue(this.siteFiles.FileEntity.file_id);
    this.siteFileForm.controls['photo_direction'].setValue(this.siteFiles.FileEntity.photo_direction);
    this.siteFileForm.controls['latitude_dd'].setValue(this.siteFiles.FileEntity.latitude_dd);
    this.siteFileForm.controls['longitude_dd'].setValue(this.siteFiles.FileEntity.longitude_dd);

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
    this.siteFileForm.controls['source_id'].setValue(data.source_id);
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
    if(this.siteFiles.FileEntity.file_id !== null && this.siteFiles.FileEntity.file_id !== undefined){
      this.siteService.getFileItem(this.siteFiles.FileEntity.file_id).subscribe((results) => {
        if(results.FileName !== undefined) {
          this.fileItemExists = true;
          this.fileSource = APP_SETTINGS.API_ROOT + 'Files/' + this.siteFiles.FileEntity.file_id + '/item';
          this.siteFiles.FileEntity.name = results.FileName;
          this.siteFileForm.controls['name'].setValue(this.siteFiles.FileEntity.name);
          this.setFileSourceAgency();
          this.setFileSource();
        }else{
          this.fileItemExists = false;
        }
      });
    }else{
      this.fileItemExists = false;
    }
  }

  setFileSourceAgency(){
    this.siteService
    .getFileSource(this.siteFiles.FileEntity.source_id)
    .subscribe((results) => {
        this.siteFiles.FileEntity.agency_id = results.agency_id;
        this.agencyNameForCap = results.agency_name;
        this.siteFileForm.controls['agency_id'].setValue(this.siteFiles.FileEntity.agency_id);
    });
  }

  setFileSource(){
    this.siteService
    .getSourceName(this.siteFiles.FileEntity.source_id)
    .subscribe((results) => {
        this.siteFiles.FileEntity.FULLname = results.source_name;
        this.siteFileForm.controls['FULLname'].setValue(this.siteFiles.FileEntity.FULLname);
    });
  }

  // Re-upload file or add missing file
  saveFileUpload() {
    // update this.siteFiles
    // update siteFilesForm
    let siteFileSubmission = JSON.parse(JSON.stringify(this.siteFileForm.value));
    delete siteFileSubmission.data_file_id;
    console.log(siteFileSubmission);
    // post file
    this.siteEditService.uploadFile(siteFileSubmission).subscribe((response) => {
      console.log(response)
      // file stamp
      let fileStamp = this.siteEditService.fileStamp();
      // push into files table
      this.initSiteFiles.push(response);
    })
    this.fileUploading = false;
    this.fileItemExists = true;
  }

  // Set file attributes
  getFileName(event) {
    this.siteFiles.FileEntity.name = event.target.files[0].name;
    this.siteFileForm.controls['name'].setValue(this.siteFiles.FileEntity.name);
    this.siteFiles.File = event.target.files[0];
    this.siteFileForm.controls['File'].setValue(this.siteFiles.File);
    this.fileUploading = true;
  }

  cancelFile() {
    // Reset file inputs
    this.changeDetector.detectChanges();
    if(this.upload !== undefined){
      this.upload.nativeElement.value = '';
    }

    this.showFileForm = false;

    this.siteFileForm.reset();

    this.siteFiles = {
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
        data_file_id: null,
        instrument_id: null,
        last_updated: null,
        last_updated_by: null,
        site_description: null,
        photo_direction: null,
        latitude_dd: null,
        longitude_dd: null,
      },
      File: null
    };
  }

  submitSiteForm(){
    this.siteForm.markAllAsTouched();
    if(this.siteForm.valid){
      this.valid = true;
      console.log(this.landownerForm);
      console.log(this.siteForm);
      // Post landowner if added/changed
      if(this.landownerForm.dirty){
        if(this.landownerForm.valid){
          this.landownerValid = true;
          if(this.landownerForm.landownercontact_id !== undefined && this.landownerForm.landownercontact_id !== null && this.landownerForm.landownercontact_id > 0){
            this.siteEditService.putLandowner(this.landownerForm.landownercontact_id, this.landownerForm.value).subscribe((response) => {
              console.log(response);
              this.putSite();
              this.dialogRef.close();
            })
          }else{
            this.siteEditService.postLandowner(this.landownerForm.value).subscribe((response) => {
              console.log(response.landownercontactid);
              console.log(response)
              console.log("post")
              this.siteForm.controls["landownercontact_id"].setValue(response.landownercontactid);
              console.log(this.siteForm.controls);
              this.putSite();
              this.dialogRef.close();
            })
          }
        }else{
          this.landownerValid = false;
          this.putSite();
          alert("Error creating landowner contact.")
          this.dialogRef.close();
        }
      }
      else{
        console.log("no landowner edits")
        this.putSite();
        this.dialogRef.close();
      }
      // Close dialog
    }else{
      this.valid = false;
      alert("Some required site fields are missing or incorrect.  Please fix these fields before submitting.")
    }
    this.fileUploading = false;
  }

  putSite() {
    let self = this;
    // Convert dms to dd
    if(this.latLngUnit === "dms"){
      this.siteForm.controls['latitude_dd'].setValue(this.azimuth(this.siteForm.controls.latdeg.value, this.siteForm.controls.latmin.value, this.siteForm.controls.latsec.value));
      this.siteForm.controls['longitude_dd'].setValue(this.azimuth(this.siteForm.controls.londeg.value, this.siteForm.controls.lonmin.value, this.siteForm.controls.lonsec.value));
    }
    // Copy form value object and delete extra fields, include disabled form values in submission
    let siteSubmission = JSON.parse(JSON.stringify(this.siteForm.getRawValue()));
    delete siteSubmission.latdeg; delete siteSubmission.latmin; delete siteSubmission.latsec; delete siteSubmission.londeg; delete siteSubmission.lonmin; delete siteSubmission.lonsec;
    delete siteSubmission.housingType; delete siteSubmission.siteHousings; delete siteSubmission.networkType; delete siteSubmission.networkName;

    console.log(siteSubmission)

    this.siteEditService.putSite(this.data.site.site_id, siteSubmission)
      .subscribe(
          (data) => {
              console.log('Form submitted successfully'); 
              console.log(data)                          
          },
          (error) => {
              console.log(error);
          }
      );

    // Copy form value object, include disabled form values in submission
    let siteHousingValue = JSON.parse(JSON.stringify(this.siteForm.controls["siteHousings"].getRawValue()));
    siteHousingValue.forEach(function(value){
      delete value.housingType;
    })
    // Delete housing info using housing ids
    let siteHousings = this.housingTypeArray.join(",");
    this.data.siteHousing.forEach(function(housing){
      if(housing.housingType !== null && !siteHousings.includes(housing.housingType)){
        console.log("delete " + housing.housingType);
        self.siteEditService.deleteSiteHousings(housing.site_housing_id).subscribe((response) => {
            console.log(response);
        });
      }
    })

    if(this.data.networkName !== undefined){
      let initNetworkNames = this.data.networkName.split(',');
      let selectedNames = this.selectedNetworkNames.join(',');
      //Remove NetNames
      initNetworkNames.forEach(function (networkName) {
        networkName = networkName.trim()
        if(!selectedNames.includes(networkName)){
          console.log("delete" + networkName);
          // self.siteEditService.deleteNetworkNames(self.siteForm.site_id, networkName.network_name_id ).subscribe((response) => {
          //   console.log(response);
          // });
        }
      });
      //Add NetNames
      this.networkNames.forEach(function (networkName) {
        let initname;
        initNetworkNames.forEach(function (name) {
          initname = name.trim();
          // Only add new network names
          if(networkName.selected && !selectedNames.includes(initname) && !self.data.networkName.includes(networkName.name)){
            console.log("add" + networkName.name);
            // self.siteEditService.postNetworkNames(self.data.site.site_id, networkName.network_name_id).subscribe((response) => {
            //   console.log(response);
            // });
          }
        });
      });
    }else{
      // No network names to remove
      //Add NetNames
      this.networkNames.forEach(function (networkName) {
        if(networkName.selected){
          // self.siteEditService.postNetworkNames(self.data.site.site_id, networkName.network_name_id).subscribe((response) => {
          //   console.log(response);
          // });
        }
      });
    }
    if(this.data.networkType !== undefined){
      let selectedTypes = this.selectedNetworkTypes.join(',');
      let initNetworkTypes = this.data.networkType.split(',');
      //Remove NetTypes
      initNetworkTypes.forEach(function (networkType) {
        networkType = networkType.trim();
        if(!selectedTypes.includes(networkType)){
          console.log("delete" + networkType);
          // self.siteEditService.deleteNetworkTypes(self.data.site.site_id, networkType.network_type_id ).subscribe((response) => {
          //   console.log(response);
          // });
        }
      });
      //Add NetTypes
      this.networkTypes.forEach(function (networkType) {
        let initnetwork;
        initNetworkTypes.forEach(function (network) {
          initnetwork = network.trim();
          // Only add new network names
          if(networkType.selected && !selectedTypes.includes(initnetwork) && !self.data.networkName.includes(networkType.network_type_name)){
            console.log("add" + networkType.network_type_name);
            // self.siteEditService.postNetworkTypes(self.data.site.site_id, networkType.network_type_id ).subscribe((response) => {
            //   console.log(response);
            // });
          }
        });
      });
    }else{
      // No network types to remove
      //Add NetTypes
      this.networkTypes.forEach(function (networkType) {
        if(networkType.selected){
          console.log("add" + networkType.network_type_name);
          // self.siteEditService.postNetworkTypes(self.data.site.site_id, networkType.network_type_id ).subscribe((response) => {
          //   console.log(response);
          // });
        }
      });
    }
    // Insert housing info
    //Add housing info
    if(this.siteForm.controls.siteHousings.dirty || this.siteForm.controls.housingType.dirty){
      siteHousingValue.forEach(function (ht) {
        if (ht.site_housing_id !== null) {
          console.log(ht)
          //PUT it
          self.siteEditService.putSiteHousings(ht.site_housing_id, ht).subscribe((response) => {
            console.log(response);
          });
        } else {
          // Remove site housing id field before sending to avoid 500 error
          delete ht.site_housing_id;
          //POST it
          self.siteEditService.postSiteHousings(ht).subscribe((response) => {
            console.log(response);
          });
        }
      });
    }
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
    let fileSubmission = JSON.parse(JSON.stringify(this.siteFileForm.value));
    console.log(fileSubmission)
    if(this.siteFileForm.valid){
      this.fileValid = true;
      // check if source already exists?
      var theSource = { source_name: fileSubmission.FULLname, agency_id: fileSubmission.agency_id };
      console.log(theSource)
      //post source first to get source_id
      this.siteEditService.postSource(theSource)
      .subscribe(
          (response) => {
            console.log(console.log(response))
            // delete fullname, agency_id, site_description
            delete fileSubmission.FULLname; delete fileSubmission.agency_id; delete fileSubmission.site_description;
            if (fileSubmission.filetype_id !== 8) {
              //then POST fileParts (Services populate PATH)
              this.siteEditService.uploadFile(fileSubmission)
                .subscribe(
                    (data) => {
                      console.log(data)
                            // Update file list in files tab
                    }
                );
            }
            else{
              // Link FileTypes
              fileSubmission.source_id = response.source_id; fileSubmission.site_id = this.data.site.site_id;

            }
          },
          (error) => {
              console.log(error);
          }
      );
    }else{
      this.fileValid = false;
      alert("Some required site file fields are missing or incorrect.  Please fix these fields before submitting.")
    }
  }
}
