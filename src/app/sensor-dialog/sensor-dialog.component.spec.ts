import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SensorDialogComponent } from './sensor-dialog.component';
import { of } from 'rxjs';

describe('SensorDialogComponent', () => {
  let component: SensorDialogComponent;
  let fixture: ComponentFixture<SensorDialogComponent>;

  const data = 
  {
    row_data: {
      instrument_id: 5,
      instrument_status: [{status: "Deployed", member_id: 5, instrument_status_id: 2, vdatum: "NADV88"}, {status: "Retrieved", member_id: 2, instrument_status_id: 1}, {status: "Lost", member_id: 2, instrument_status_id: 3}],
      statusType: "Deployed"
    },
    utcPreview: {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensorDialogComponent ],
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
    fixture = TestBed.createComponent(SensorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSensorFiles and add to sensorFiles or nwisFiles array', () => {
    const response = [{is_nwis: 1}, {file: []}];
    spyOn(component.siteService, 'getSensorFiles').and.returnValue(
        of(response)
    );
    component.getSensorFiles();
    fixture.detectChanges();
    expect(component.sensorFiles.length).toEqual(1);
    expect(component.nwisFiles.length).toEqual(1);
  });

  it('should call setMembers and add to Members array', () => {
    const response = {fname: "John", lname: "Smith"};
    let memberSpy = spyOn(component.siteService, 'getMemberName').and.returnValue(
        of(response)
    );
    component.setMembers();
    fixture.detectChanges();
    expect(component.members.length).toEqual(3);
    expect(memberSpy).toHaveBeenCalledTimes(3);
    expect(component.members[0]).toEqual({name: "John Smith", status: "Deployed"});
  });

});
