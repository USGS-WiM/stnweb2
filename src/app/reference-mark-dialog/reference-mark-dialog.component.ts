import { Component, OnInit, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-reference-mark-dialog',
  templateUrl: './reference-mark-dialog.component.html',
  styleUrls: ['./reference-mark-dialog.component.scss']
})
export class ReferenceMarkDialogComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  public opType;
  public hdatum;
  public hmethod;
  public vdatum;
  public vmethod;
  public opQuality;
  public datumFiles;

  filesDataSource;

  displayedDatumFileColumns: string[] = [
    'FileDate',
    'FileName',
  ];

  constructor(
    private dialogRef: MatDialogRef<ReferenceMarkDialogComponent>,
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
      if(this.data.row_data.op_quality_id !== undefined){
        this.setOPQuality();
      }
      this.getDatumFiles();
    }
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
    let self = this;

    this.siteService
    .getVDatum(this.data.row_data.vdatum_id)
    .subscribe((results) => {
      this.vdatum = results.datum_name;
    });
  }

  setVCollectionMethod() {
    let self = this;

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

  getDatumFiles(){
    this.siteService
    .getDatumLocFiles(this.data.row_data.objective_point_id)
    .subscribe((results) => {
      if(results.length > 0){
        this.datumFiles = results;
      }
      
      this.filesDataSource = new MatTableDataSource(this.datumFiles);
      this.filesDataSource.paginator = this.paginator;
    });
  }

}
