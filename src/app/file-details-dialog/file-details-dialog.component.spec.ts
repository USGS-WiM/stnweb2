import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FileDetailsDialogComponent } from './file-details-dialog.component';
import { of } from 'rxjs';

describe('FileDetailsDialogComponent', () => {
  let component: FileDetailsDialogComponent;
  let fixture: ComponentFixture<FileDetailsDialogComponent>;

  const data = 
    {  
      row_data: {
        filetype_id: 5,
        data_file_id: 5,
        source_id: 5,
      },
      type: {},
      siteInfo: {}
    }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileDetailsDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [HttpClientTestingModule,
        NoopAnimationsModule,
        MatTableModule,
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFileType and set fileType', () => {
    const response = {filetype: "photo"};
    spyOn(component.siteService, 'getFileType').and.returnValue(
        of(response)
    );
    component.setFileType();
    fixture.detectChanges();
    expect(component.fileType).toEqual("photo");
  });

  it('if fileType is Data, approval date and name, elevation, processed date and collect date should be set', () => {
    const response = {filetype: "Data"};
    const approvalDateResponse = {approval_date: "2020-09-16T16:05:04", member_id: 5};
    const memberNameResponse = {lname: "Smith", fname: "John"};
    const dataFileResponse = {collect_date: "2020-09-16T16:05:04", elevation_status: "Final", processor_id: 5}
    spyOn(component.siteService, 'getFileType').and.returnValue(
        of(response)
    );
    spyOn(component.siteService, 'getApproval').and.returnValue(
      of(approvalDateResponse)
    );
    spyOn(component.siteService, 'getMemberName').and.returnValue(
      of(memberNameResponse)
    );
    spyOn(component.siteService, 'getDataFile').and.returnValue(
      of(dataFileResponse)
    );
    component.setFileType();
    fixture.detectChanges();
    expect(component.fileType).toEqual("Data");
    expect(component.approvedBy).toEqual("John Smith");
    expect(component.approvedOn).toEqual("09/16/2020");
    expect(component.elevation).toEqual("Final");
    expect(component.collectDate).toEqual("09/16/2020");
    expect(component.processorName).toEqual("John Smith");
  });

  it('should call setSource if data has source_id', () => {
    const response = {source_name: "STN Admin"};

    spyOn(component.siteService, 'getSourceName').and.returnValue(
        of(response)
    );

    component.setSource();
    fixture.detectChanges();
    expect(component.sourceName).toEqual("STN Admin");
  });

  it('should call setSourceAgency if site has source_id', () => {
    const response = {agency_name: "USGS"};

    spyOn(component.siteService, 'getFileSource').and.returnValue(
        of(response)
    );

    component.setSourceAgency();
    fixture.detectChanges();
    expect(component.sourceAgency).toEqual("USGS");
  });
});
