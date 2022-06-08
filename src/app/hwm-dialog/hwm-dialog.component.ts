import { Component, OnInit, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-hwm-dialog',
  templateUrl: './hwm-dialog.component.html',
  styleUrls: ['./hwm-dialog.component.scss']
})
export class HwmDialogComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('filesSort', { static: false }) filesSort: MatSort;
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

  infoExpanded = true;
  filesExpanded = false;

  filesDataSource = new MatTableDataSource<any>();
  blankFilesDataSource = new MatTableDataSource<any>();
  sortedFilesData = [];
  
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
    // Display a blank row if no files
    this.blankFilesDataSource.data = [{date: "---", name: "---"}];
    
    if(this.data.row_data !== undefined){
      this.getHWMFiles();
      this.setHDatum();
      this.setHCollectionMethod();
      this.setMemberName();
      this.setHWMType();
      this.setHWMMarker();
      this.setHWMQuality();
      if(this.data.row_data.vdatum_id !== undefined){
        this.setVDatum();
        this.setVCollectionMethod();
      }
      if(this.data.row_data.stillwater === 1){
        this.stillwater = "Yes";
      }else{
        this.stillwater = "No";
      }
    }
  }

  ngAfterViewInit(): void {
    this.filesDataSource.sort = this.filesSort;
  }

  getHWMFiles(){
    this.siteService
    .getHWMFiles(this.data.row_data.hwm_id)
    .subscribe((results) => {
      if(results.length > 0){
        results.forEach(function(result){
          // Format file date
          if(result.file_date !== undefined && !result.file_date.includes("/")){
            let fileDate = result.file_date.split("T")[0];
            fileDate = fileDate.split("-");
            fileDate = fileDate[1] + "/" + fileDate[2] + "/" + fileDate[0];
            result.file_date = fileDate;
          }
        });
        this.hwmFiles = results;
      }

      this.filesDataSource.data = this.hwmFiles;
      this.filesDataSource.paginator = this.paginator;
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

  sortFilesData(sort: Sort) {
    const data = this.filesDataSource.data.slice();
    if (!sort.active || sort.direction === '') {
        this.sortedFilesData = data;
        return;
    }
    /* istanbul ignore next */
    this.sortedFilesData = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
            case 'name':
                return this.compare(a.name, b.name, isAsc);
            case 'file_date':
                let aDate = this.checkDate(a.file_date);
                let bDate = this.checkDate(b.file_date);
                return this.compare(aDate, bDate, isAsc);
            default:
                return 0;
        }
    });

    // Need to update the data source to update the table rows
    this.filesDataSource.data = this.sortedFilesData;
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  checkDate(date) {
      return new Date(date);
  }

}
