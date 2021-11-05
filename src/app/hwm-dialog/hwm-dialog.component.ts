import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-hwm-dialog',
  templateUrl: './hwm-dialog.component.html',
  styleUrls: ['./hwm-dialog.component.scss']
})
export class HwmDialogComponent implements OnInit {
  public hwmFiles = [];
  public hdatum;
  public hmethod;
  public flagMember;
  public hwmType;
  public hwmMarker;
  public hwmQuality;
  public vdatum;
  public vmethod;
  public stillwater;
  public surveyMember;
  
  displayedHWMFileColumns: string[] = [
    'FileDate',
    'FileName',
  ];

  constructor(
    private dialogRef: MatDialogRef<HwmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    if(this.data.row_data !== undefined){
      this.getHWMFiles();
      this.setHDatum();
      this.setHCollectionMethod();
      this.setMemberName();
      this.setHWMType();
      this.setHWMMarker();
      this.setHWMQuality();
      if(this.data.row_data.vdatum !== undefined){
        this.setVDatum();
      }
      if(this.data.row_data.vdatum !== undefined){
        this.setVCollectionMethod();
      }
      if(this.data.row_data.stillwater === 1){
        this.stillwater = "Yes";
      }else{
        this.stillwater = "No";
      }
    }
  }

  getHWMFiles(){
    this.siteService
    .getHWMFiles(this.data.row_data.hwm_id)
    .subscribe((results) => {
      if(results.length > 0){
        this.hwmFiles = results;
      }
    });
  }

  setHDatum() {
    let self = this;

    this.siteService
    .getHDatum()
    .subscribe((results) => {
      results.forEach(function(result){
        if (result.datum_id === self.data.row_data.hdatum_id){
            self.hdatum = result.datum_name;
        }
      });
    });
  }

  setHCollectionMethod() {
    let self = this;

    this.siteService
    .getHCollectionMethod()
    .subscribe((results) => {
      results.forEach(function(result){
        if (result.hcollect_method_id === self.data.row_data.hcollect_method_id){
            self.hmethod = result.hcollect_method;
        }
      });
    });
  }

  setMemberName() {
    let self = this;

    // Flagging member
    this.siteService
    .getMemberName(this.data.row_data.flag_member_id)
    .subscribe((results) => {
        self.flagMember = results.fname + " " + results.lname;
    });

    
    // Survey member
    if(this.data.row_data.survey_member_id !== undefined){
      this.siteService
      .getMemberName(this.data.row_data.survey_member_id)
      .subscribe((results) => {
          self.surveyMember = results.fname + " " + results.lname;
      });
    }
  }

  setHWMType(){
    this.siteService
    .getHWMType(this.data.row_data.hwm_id)
    .subscribe((results) => {
        this.hwmType = results.hwm_type;
    });
  }

  setHWMMarker(){
    this.siteService
    .getHWMMarker(this.data.row_data.hwm_id)
    .subscribe((results) => {
      if(results !== null){
        this.hwmMarker = results.marker1;
      }
    });
  }

  setHWMQuality(){
    this.siteService
    .getHWMQuality(this.data.row_data.hwm_id)
    .subscribe((results) => {
        this.hwmQuality = results.hwm_quality;
    });
  }

  setVDatum() {
    this.siteService
    .getVDatum(this.data.row_data.vdatum_id)
    .subscribe((results) => {
      this.vdatum = results.datum_name;
    });
  }

  setVCollectionMethod() {
    this.siteService
    .getVCollectionMethod(this.data.row_data.vcollect_method_id)
    .subscribe((results) => {
      this.vmethod = results.vcollect_method;
    });
  }

}
