import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

import { HwmDialogComponent } from './hwm-dialog.component';
import { of } from 'rxjs';

describe('HwmDialogComponent', () => {
  let component: HwmDialogComponent;
  let fixture: ComponentFixture<HwmDialogComponent>;

  const data = 
  {  
    row_data: {
      hdatum_id: 5,
      vdatum_id: 5,
      hcollect_method_id: 5,
      vcollect_method_id: 5,
      op_quality_id: 5,
      objective_point_id: 5,
      survey_member_id: 5,
      flag_member_id: 5,
      hwm_id: 5,
    },
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HwmDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [HttpClientTestingModule,
        NoopAnimationsModule,
        MatTableModule,
        MatExpansionModule,
        MatSortModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HwmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getHWMFiles and set set hwmFiles', () => {
    const response = [{file:[]}];
    spyOn(component.siteService, 'getHWMFiles').and.returnValue(
        of(response)
    );
    component.getHWMFiles();
    fixture.detectChanges();
    expect(component.hwmFiles).toEqual(response);
  });

  it('should call getHDatum and set hdatum', () => {
    const response = [{datum_id: 5, datum_name: "WGS84"}];
    spyOn(component.siteService, 'getHDatum').and.returnValue(
        of(response)
    );
    component.setHDatum();
    fixture.detectChanges();
    expect(component.hdatum).toEqual("WGS84");
  });

  it('should call getHcollectionMethod and set hmethod', () => {
    const response = [{hcollect_method_id: 5, hcollect_method: "test"}];
    spyOn(component.siteService, 'getHCollectionMethod').and.returnValue(
        of(response)
    );
    component.setHCollectionMethod();
    fixture.detectChanges();
    expect(component.hmethod).toEqual("test");
  });

  it('if fileType is Data, approval date and name, elevation, processed date and collect date should be set', () => {
    const memberNameResponse = {lname: "Smith", fname: "John"};

    let memberNameSpy = spyOn(component.siteService, 'getMemberName').and.returnValue(
      of(memberNameResponse)
    );
    component.setMemberName();
    fixture.detectChanges();
    expect(component.flagMember).toEqual("John Smith");
    expect(component.flagMember).toEqual("John Smith");
    expect(memberNameSpy).toHaveBeenCalledTimes(2);
  });

  it('should call getHWMType and set hwmType', () => {
    const response = {hwm_type: "test"};
    spyOn(component.siteService, 'getHWMType').and.returnValue(
        of(response)
    );
    component.setHWMType();
    fixture.detectChanges();
    expect(component.hwmType).toEqual("test");
  });

  it('should call getHWMMarker and set hwmMarker', () => {
    const response = {marker1: "test"};
    spyOn(component.siteService, 'getHWMMarker').and.returnValue(
        of(response)
    );
    component.setHWMMarker();
    fixture.detectChanges();
    expect(component.hwmMarker).toEqual("test");
  });

  it('should call getHWMQuality and set hwmQuality', () => {
    const response = {hwm_quality: "test"};
    spyOn(component.siteService, 'getHWMQuality').and.returnValue(
        of(response)
    );
    component.setHWMQuality();
    fixture.detectChanges();
    expect(component.hwmQuality).toEqual("test");
  });

  it('should call getVDatum and set vdatum', () => {
    const response = {datum_name: "NADV88"};
    spyOn(component.siteService, 'getVDatum').and.returnValue(
        of(response)
    );
    component.setVDatum();
    fixture.detectChanges();
    expect(component.vdatum).toEqual("NADV88");
  });

  it('should call getVCollectionMethod and set vmethod', () => {
    const response = {vcollect_method_id: 5, vcollect_method: "test"};
    spyOn(component.siteService, 'getVCollectionMethod').and.returnValue(
        of(response)
    );
    component.setVCollectionMethod();
    fixture.detectChanges();
    expect(component.vmethod).toEqual("test");
  });
});