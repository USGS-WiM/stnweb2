import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-ref-datum-edit',
  templateUrl: './ref-datum-edit.component.html',
  styleUrls: ['./ref-datum-edit.component.scss']
})
export class RefDatumEditComponent implements OnInit {
  public form;
  public rd;
  public hmethods;
  public hdatums;
  public vmethods;
  public vdatums;
  public opQualities;
  public types;
  public formattedEstDate;
  public formattedRecDate;

  constructor(
    private dialogRef: MatDialogRef<RefDatumEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    this.rd = this.data.rd;
    this.hmethods = this.data.hmethodList;
    this.hdatums = this.data.hdatumList;
    console.log(this.rd)

    // get types
    // get vdatum and method
    this.getOPQuality();
    this.getVDatums();
    this.getVMethods();
    this.initForm();
  }

  getVDatums() {
    this.siteService
    .getVDatumLookup()
    .subscribe((results) => {
      this.vdatums = results;
    });
  }

  getVMethods() {
    this.siteService
    .getVMethodLookup()
    .subscribe((results) => {
      this.vmethods = results;
    });
  }

  getOPQuality() {
    let self = this;

    this.siteService
    .getOPQualityLookup()
    .subscribe((results) => {
      this.opQualities = results;
    });
  }
  
  initForm() {
    console.log(this.rd.date_established)
    this.form = new FormGroup({
      type: new FormControl(this.rd.type, Validators.required),
      name: new FormControl(this.rd.name, Validators.required),
      description: new FormControl(this.rd.description, Validators.required),
      latitude_dd: new FormControl(this.rd.latitude_dd),
      longitude_dd: new FormControl(this.rd.longitude_dd),
      hdatum_id: new FormControl(this.rd.hdatum_id),
      hcollect_method_id: new FormControl(this.rd.hcollect_method_id),
      elev_ft: new FormControl(this.rd.elev_ft),
      vdatum_id: new FormControl(this.rd.vdatum_id),
      vcollect_method_id: new FormControl(this.rd.vcollect_method_id),
      op_quality_id: new FormControl(this.rd.op_quality_id),
      op_notes: new FormControl(this.rd.op_notes),
      date_established: new FormControl(this.rd.date_established),
      date_recovered: new FormControl(this.rd.date_recovered),
    })
  }

}