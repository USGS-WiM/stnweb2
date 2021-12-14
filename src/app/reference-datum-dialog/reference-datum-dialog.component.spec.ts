import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ReferenceDatumDialogComponent } from './reference-datum-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { of } from 'rxjs';

describe('ReferenceDatumDialogComponent', () => {
  let component: ReferenceDatumDialogComponent;
  let fixture: ComponentFixture<ReferenceDatumDialogComponent>;

  const data = 
    {  
      row_data: {
        hdatum_id: 5,
        vdatum_id: 5,
        hcollect_method_id: 5,
        vcollect_method_id: 5,
        op_quality_id: 5,
        objective_point_id: 5,
      },
    }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceDatumDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [HttpClientTestingModule,
        NoopAnimationsModule,
        MatExpansionModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceDatumDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getOPType and set opType', () => {
    const response = {op_type: "test"};
    spyOn(component.siteService, 'getOPType').and.returnValue(
        of(response)
    );
    component.setOPType();
    fixture.detectChanges();
    expect(component.opType).toEqual("test");
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

  it('should call getOPQuality and set opQuality', () => {
    const response = {quality: "test"};
    spyOn(component.siteService, 'getOPQuality').and.returnValue(
        of(response)
    );
    component.setOPQuality();
    fixture.detectChanges();
    expect(component.opQuality).toEqual("test");
  });

  it('should call getDatumLocfiles and set vmethod', () => {
    const response = [{file:[]}];
    spyOn(component.siteService, 'getDatumLocFiles').and.returnValue(
        of(response)
    );
    component.getDatumFiles();
    fixture.detectChanges();
    expect(component.datumFiles).toEqual(response);
  });
});
