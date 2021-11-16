import { L } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.scss']
})
export class SiteEditComponent implements OnInit {
  public networkTypes;
  public networkNames;
  public hDatums;
  public hMethods;
  public priorities;
  public siteHousings;
  public stateList;
  public countyList;
  public perm_housing_installed;
  public sensorNotAppropriate;
  public accessGranted;
  public siteHousingArray = [];
  public siteHousingLookup;
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
  };

  siteForm;
  
  displayedColumns: string[] = [
    'HousingType',
    'HousingLength',
    'HousingMaterial',
    'Amount',
    'Notes',
  ];

  constructor(
    private dialogRef: MatDialogRef<SiteEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    console.log(this.data.site)
    this.hDatums = this.data.hdatumList;
    this.hMethods = this.data.hmethodList;
    this.getNetworkTypes();
    this.getNetworkNames();
    this.setInitialSite();
    this.getSiteHousings();

    this.siteForm = new FormGroup({
      site_description: new FormControl(this.site.description),
      site_notes: new FormControl(this.site.internal_notes),
      latitude_dd: new FormControl(this.site.latitude_dd),
      longitude_dd: new FormControl(this.site.longitude_dd),
      is_permanent_housing_installed: new FormControl(this.perm_housing_installed),
      access_granted: new FormControl(this.accessGranted),
      hdatum: new FormControl(this.site.hdatum),
      hmethod: new FormControl(this.site.hmethod),
      waterbody: new FormControl(this.site.waterbody),
      drainage_area_sqmi: new FormControl(this.site.drainage_area),
      usgs_sid: new FormControl(this.site.usgs_id),
      noaa_sid: new FormControl(this.site.noaa_id),
      other_sid: new FormControl(this.site.other_id),
      safety_notes: new FormControl(this.site.safety_notes),
      zone: new FormControl(this.site.zone),
      address: new FormControl(this.site.address),
      city: new FormControl(this.site.city),
      state: new FormControl(this.site.state),
      county: new FormControl(this.site.county),
      zip: new FormControl(this.site.zip),
    });
  }

  getNetworkTypes() {
    let self = this;
    this.siteService.getNetworkTypesList().subscribe((results) => {
      results.forEach(function(result){
        if (self.data.networkType !== undefined && self.data.networkType.includes(result.network_type_name)){
          result.selected = true;
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
        }else{
          result.selected = false;
        }
      })
      this.networkNames = results;
    });
  }

  getSiteHousings() {
    this.siteService.getAllHousingTypes().subscribe((results) => {
      this.siteHousingLookup = results;
    });
  }

  setSelected(event, data) {
    data.selected = event.checked;
  }

  changeTableValue(value){
    this.siteHousingArray[0].housingType = value;
  }

  // Populate site info initially with existing site info
  setInitialSite() {
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
    this.siteHousingArray = this.data.siteHousing;
    
    this.perm_housing_installed = this.data.site.is_permanent_housing_installed !== undefined && this.data.site.is_permanent_housing_installed === "Yes" ? "Yes" : "No";
    this.sensorNotAppropriate = this.data.site.sensor_not_appropriate !== undefined && this.sensorNotAppropriate === 1 ? true : false;
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
          }
        }
      })
  }

  submitSiteForm(){
    console.log("submitted!");
  }
}
