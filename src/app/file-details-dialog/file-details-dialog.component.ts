import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { APP_SETTINGS } from '../app.settings';

@Component({
  selector: 'app-file-details-dialog',
  templateUrl: './file-details-dialog.component.html',
  styleUrls: ['./file-details-dialog.component.scss']
})
export class FileDetailsDialogComponent implements OnInit {
  public fileType;
  public sourceAgency;
  public sourceName;
  public associatedFileUrl;
  public approvedBy;
  public approvedOn;
  public collectDate;
  public processorName;
  public elevation;
  public previewCaption;
  public fileItemExists;

  constructor(
    private dialogRef: MatDialogRef<FileDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    if(this.data.row_data !== undefined){
      this.setFileType();
      if(this.data.row_data.source_id !== undefined){
        this.setSourceAgency();
        this.setSource();
      }

      this.getFile();

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
      if (this.data.row_data.description === undefined || this.data.row_data.description == ''){
        this.previewCaption.description = "(description)";
      }
      if (this.data.siteInfo.site_description === undefined || this.data.siteInfo.site_description == ''){
        this.previewCaption.site_description = '(site description)'
      }
      if (this.data.siteInfo.county === undefined || this.data.siteInfo.county == ''){
        this.previewCaption.county = '(county)'
      }
      if (this.data.siteInfo.state === undefined || this.data.siteInfo.state == ''){
        this.previewCaption.state = '(state)'
      }
      if (this.data.row_data.photo_date === undefined || this.data.row_data.photo_date == ''){
        this.previewCaption.photo_date = '(photo date)'
      }
    }
  }

  getFile() {
    if(this.data.row_data.file_id !== null && this.data.row_data.file_id !== undefined){
      this.siteService.getFileItem(this.data.row_data.file_id).subscribe((results) => {
        if(results.Length > 0) {
          this.fileItemExists = true;
          this.associatedFileUrl = APP_SETTINGS.API_ROOT + 'Files/' + this.data.row_data.file_id + '/Item';
        }else{
          this.fileItemExists = false;
        }
      });
    }else{
      this.fileItemExists = false;
    }
  }

  setFileType(){
    this.siteService
    .getFileType(this.data.row_data.filetype_id)
    .subscribe((results) => {
        this.fileType = results.filetype;
        if(this.fileType === 'Data' && this.data.row_data.data_file_id !== undefined){
          this.siteService
          .getApproval(this.data.row_data.data_file_id)
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
          .getDataFile(this.data.row_data.data_file_id)
          .subscribe((datafileResults) => {
              this.elevation = datafileResults.elevation_status;
              this.collectDate = datafileResults.collect_date;
              if(datafileResults.processor_id !== undefined && datafileResults.processor_id !== 0){
                this.siteService
                .getMemberName(datafileResults.processor_id)
                .subscribe((memberResult) => {
                  this.processorName = memberResult.fname + " " + memberResult.lname;
                });
              }
          });
        }
    });
  }

  setSourceAgency(){
    this.siteService
    .getFileSource(this.data.row_data.source_id)
    .subscribe((results) => {
        this.sourceAgency = results.agency_name;
        if (this.sourceAgency === undefined || this.sourceAgency === ''){
          this.previewCaption.sourceAgency = '(source agency)'
        }else{
          this.previewCaption.sourceAgency = this.sourceAgency;
        }
    });
  }

  setSource(){
    this.siteService
    .getSourceName(this.data.row_data.source_id)
    .subscribe((results) => {
        this.sourceName = results.source_name;
        if (this.sourceName === undefined || this.sourceName === ''){
          this.previewCaption.sourceName = '(source name)'
        }else{
          this.previewCaption.sourceName = this.sourceName;
        }
    });
  }

}
