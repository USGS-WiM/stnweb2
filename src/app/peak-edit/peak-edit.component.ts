import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-peak-edit',
  templateUrl: './peak-edit.component.html',
  styleUrls: ['./peak-edit.component.scss']
})
export class PeakEditComponent implements OnInit {

  public peak;

  constructor(
    private dialogRef: MatDialogRef<PeakEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    this.peak = this.data.peak;
    console.log(this.peak);

    this.initForm();
  }

  initForm() {
    
  }

}
