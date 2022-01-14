import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';

@Component({
  selector: 'app-hwm-edit',
  templateUrl: './hwm-edit.component.html',
  styleUrls: ['./hwm-edit.component.scss']
})
export class HwmEditComponent implements OnInit {

  public form;
  public hwm;
  public vdatums;
  public vmethods;
  public initHWMFiles = [];
  public latLngUnit = "decdeg";
  public incorrectDMS = false;
  public dms = {
    latdeg: null,
    latmin: null,
    latsec: null,
    londeg: null,
    lonmin: null,
    lonsec: null,
  }

  displayedFileColumns: string[] = [
    'FileName',
    'FileDate',
  ];

  infoExpanded = true;
  filesExpanded = false;

  constructor(
    private dialogRef: MatDialogRef<HwmEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    this.hwm = this.data.hwm;
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

  getInitFiles() {
    let self = this;
    this.data.files.forEach(function(file){
      if(file.objective_point_id === self.hwm.objective_point_id){
        self.initHWMFiles.push(file);
      }
    })
  }

  initForm() {
    // this.form = new FormGroup({
    //   op_type_id: new FormControl(this.hwm.op_type_id !== undefined && this.hwm.op_type_id !== "" ? this.hwm.op_type_id : null, Validators.required),
    //   name: new FormControl(this.hwm.name !== undefined && this.hwm.name !== "" ? this.hwm.name : null, Validators.required),
    //   description: new FormControl(this.hwm.description !== undefined && this.hwm.description !== "" ? this.hwm.description : null, Validators.required),
    //   op_control_identifier: new FormArray(this.controlsToAdd.map((control) => new FormGroup(this.createControlArray(control)))),
    //   op_is_destroyed: new FormControl(this.hwm.op_is_destroyed !== undefined && this.hwm.op_is_destroyed !== "" ? this.hwm.op_is_destroyed : null),
    //   latitude_dd: new FormControl(this.hwm.latitude_dd !== undefined && this.hwm.latitude_dd !== "" ? this.hwm.latitude_dd : null),
    //   longitude_dd: new FormControl(this.hwm.longitude_dd !== undefined && this.hwm.longitude_dd !== "" ? this.hwm.longitude_dd : null),
    //   objective_point_id: new FormControl(this.hwm.objective_point_id),
    //   latdeg: new FormControl(this.dms.latdeg),
    //   latmin: new FormControl(this.dms.latmin),
    //   latsec: new FormControl(this.dms.latsec),
    //   londeg: new FormControl(this.dms.londeg),
    //   lonmin: new FormControl(this.dms.lonmin),
    //   lonsec: new FormControl(this.dms.lonsec),
    //   hdatum_id: new FormControl(this.hwm.hdatum_id !== undefined && this.hwm.hdatum_id !== "" ? this.hwm.hdatum_id : null),
    //   hcollect_method_id: new FormControl(this.hwm.hcollect_method_id !== undefined && this.hwm.hcollect_method_id !== "" ? this.hwm.hcollect_method_id : null),
    //   elev_ft: new FormControl(this.hwm.elev_ft !== undefined && this.hwm.elev_ft !== "" ? this.hwm.elev_ft : null),
    //   vdatum_id: new FormControl(this.hwm.vdatum_id !== undefined && this.hwm.vdatum_id !== "" ? this.hwm.vdatum_id : null, Validators.required),
    //   vcollect_method_id: new FormControl(this.hwm.vcollect_method_id !== undefined && this.hwm.vcollect_method_id !== "" ? this.hwm.vcollect_method_id : null),
    //   uncertainty: new FormControl({value: this.hwm.uncertainty !== undefined ? this.hwm.uncertainty : null, disabled: this.unquantified}),
    //   unquantified: new FormControl(this.hwm.unquantified),
    //   op_quality_id: new FormControl(this.hwm.op_quality_id !== undefined && this.hwm.op_quality_id !== "" ? this.hwm.op_quality_id : null),
    //   op_notes: new FormControl(this.hwm.op_notes !== undefined && this.hwm.op_notes !== "" ? this.hwm.op_notes : null),
    //   date_established: new FormControl(this.hwm.date_established !== undefined && this.hwm.date_established !== "" ? this.hwm.date_established : null, Validators.required),
    //   date_recovered: new FormControl(this.hwm.date_recovered !== undefined && this.hwm.date_recovered !== "" ? this.hwm.date_recovered : null),
    //   site_id: new FormControl(this.data.site_id !== undefined && this.data.site_id !== "" ? this.data.site_id : null)
    // })
  }

}
