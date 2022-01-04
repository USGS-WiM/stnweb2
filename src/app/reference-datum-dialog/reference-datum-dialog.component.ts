import { Component, OnInit, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-reference-datum-dialog',
  templateUrl: './reference-datum-dialog.component.html',
  styleUrls: ['./reference-datum-dialog.component.scss']
})
export class ReferenceDatumDialogComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('refMarkFilesSort', { static: false }) refMarkFilesSort: MatSort;
  public opType;
  public hdatum;
  public hmethod;
  public vdatum;
  public vmethod;
  public opQuality;
  public datumFiles;
  public controlID;

  refMarkFilesDataSource = new MatTableDataSource<any>();
  sortedRefMarkFilesData = [];

  displayedDatumFileColumns: string[] = [
    'FileDate',
    'FileName',
  ];

  infoExpanded = true;
  filesExpanded = false;

  constructor(
    private dialogRef: MatDialogRef<ReferenceDatumDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    if(this.data.row_data !== undefined){
      this.setOPType();
      this.setHDatum();
      this.setHCollectionMethod();
      this.setVDatum();
      this.setVCollectionMethod();
      this.getControlID();
      if(this.data.row_data.op_quality_id !== undefined){
        this.setOPQuality();
      }
      this.getDatumFiles();
    }
  }

  ngAfterViewInit(): void {
    this.refMarkFilesDataSource.sort = this.refMarkFilesSort;
  }

  setOPType() {
    this.siteService
    .getOPType(this.data.row_data.op_type_id)
    .subscribe((results) => {
      this.opType = results.op_type;

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

  setOPQuality() {
    let self = this;

    this.siteService
    .getOPQuality(this.data.row_data.op_quality_id)
    .subscribe((results) => {
      this.opQuality = results.quality;
    });
  }

  getControlID() {
    let self = this;

    this.siteService
    .getOPControlID(this.data.row_data.objective_point_id)
    .subscribe((results) => {
      if(results.length > 0){
        self.controlID = [];
        results.forEach(function(control){
          self.controlID.push(control);
        });
      }
    });
  }

  getDatumFiles(){
    this.siteService
    .getDatumLocFiles(this.data.row_data.objective_point_id)
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
        this.datumFiles = results;
        this.refMarkFilesDataSource.data = this.datumFiles;
        this.refMarkFilesDataSource.paginator = this.paginator;
      }
    });
  }

  sortRefMarkFilesData(sort: Sort) {
    const data = this.refMarkFilesDataSource.data.slice();
    if (!sort.active || sort.direction === '') {
        this.sortedRefMarkFilesData = data;
        return;
    }
    /* istanbul ignore next */
    this.sortedRefMarkFilesData = data.sort((a, b) => {
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
    this.refMarkFilesDataSource.data = this.sortedRefMarkFilesData;
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  checkDate(date) {
      return new Date(date);
  }

}
