import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FileEditComponent } from './file-edit.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { CurrentUserService } from '@app/services/current-user.service';
import { APP_SETTINGS } from '@app/app.settings';

describe('FileEditComponent', () => {
  let component: FileEditComponent;
  let fixture: ComponentFixture<FileEditComponent>;

  const data = 
  {  
    row_data: {
      file_id: 0,
      name: "testFile.txt",
      description: "test",
      file_date: new Date(),
      site_id: 0,
      filetype_id: 3,
      source_id: 0,
      path: 'test/testFile.txt'
    },
    type: 'Site File',
    siteInfo: {
      site_id: 0,
      site_description: "test site"
    },
    addOrEdit: 'Edit',
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileEditComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
        CurrentUserService,
      ],
      imports: [HttpClientTestingModule, MatDialogModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the agency lookup', () => {
    const response: any[] = [{agency: "test"}];

    spyOn(component.siteService, 'getAgencyLookup').and.returnValue(
        of(response)
    );

    component.getAgencies();
    fixture.detectChanges();
    expect(component.agencies).toEqual(response);
  });

  it('should set the file type lookup to all types returned', () => {
    const response: any[] = [
      {filetype: "Photo"}, 
      {filetype: "Link"},
    ];
    
    spyOn(component.siteService, 'getFileTypeLookup').and.returnValue(
        of(response)
    );

    component.getFileTypes();
    fixture.detectChanges();
    expect(component.fileTypes).toEqual(response);
  });

  it('should set the file type lookup if adding a file', () => {
    component.data.addOrEdit = 'Add';
    component.fileCategory = "HWM File";
    const response: any[] = [
      {filetype: "Photo"}, 
      {filetype: "Historic Citation"}, 
      {filetype: "Field Sheets"}, 
      {filetype: "Level Notes"}, 
      {filetype: "Other"}, 
      {filetype: "Sketch"}, 
      {filetype: "Hydrograph"},
      {filetype: "Link"}
    ]
    
    spyOn(component.siteService, 'getFileTypeLookup').and.returnValue(
        of(response)
    );

    component.getFileTypes();
    fixture.detectChanges();
    expect(component.fileTypes).toEqual([
      {filetype: "Photo"}, 
      {filetype: "Historic Citation"}, 
      {filetype: "Field Sheets"}, 
      {filetype: "Level Notes"}, 
      {filetype: "Other"}, 
      {filetype: "Sketch"}, 
      {filetype: "Hydrograph"},
    ]);
  });

  it('should set the file type name', () => {
    component.fileTypes = [{filetype: "Photo", filetype_id: 1}, {filetype: "Data", filetype_id: 2}];

    let fileType = component.fileTypeLookup(1);
    fixture.detectChanges();
    expect(fileType).toEqual('Photo');
  });

  it('should set the source agency', () => {
    const response = {agency_name: "WIM", agency_id: 0};
    
    spyOn(component.siteService, 'getFileSource').and.returnValue(
        of(response)
    );

    component.setSourceAgency();
    fixture.detectChanges();
    expect(component.agencyNameForCap).toEqual("WIM");
    expect(component.file.agency_id).toEqual(0);
    expect(component.form.get('agency_id').value).toEqual(0);
  });

  it('should set the file source', () => {
    const response = {source_name: "John Smith"};
    
    spyOn(component.siteService, 'getSourceName').and.returnValue(
        of(response)
    );

    component.setSource();
    fixture.detectChanges();
    expect(component.file.FULLname).toEqual("John Smith");
    expect(component.form.get('FULLname').value).toEqual("John Smith");
  });

  it('should change value of is_nwis', () => {
    const value = {checked: true};

    component.checkIfNWIS(value);
    fixture.detectChanges();
    expect(component.file.is_nwis).toEqual(1);
  });

  it('should set the agency name for the preview caption', () => {
    component.form.get("filetype_id").value = 1;
    component.form.get("agency_id").value = 0;
    component.agencies = [{agency_name: "WIM", agency_id: 0}];
    component.updateAgencyForCaption();
    fixture.detectChanges();
    expect(component.agencyNameForCap).toEqual("WIM");
  });

  it('should set the filetype_id and autopopulate fields', () => {
    component.file = {};
    const event = {value: 1}; //Photo
    component.currentUser = {member_id: 0, fname: "John", lname: "Doe", agency_id: 0}

    component.getFileTypeSelection(event);
    fixture.detectChanges();
    expect(component.file.filetype_id).toEqual(event.value);
    expect(component.file.file_date).not.toBe(undefined);
    expect(component.file.source_id).toEqual(0);
    expect(component.file.agency_id).toEqual(0);
    expect(component.file.photo_date).not.toBe(undefined);
    expect(component.form.controls.photo_date.value).toEqual(component.file.photo_date);
  });

  it('should set file attributes', () => {
    let event = {target: {files: [{name: "testFile"}]}};

    component.getFileName(event);
    fixture.detectChanges();
    expect(component.fileUploading).toEqual(true);
    expect(component.file.File).toEqual({name: "testFile"});
    expect(component.form.get("photo_date").validator).toEqual(null);
  });

  it('should detect that file exists', () => {
    const response = {FileName: "testFile", Length : 1};
    
    spyOn(component.siteService, 'getFileItem').and.returnValue(
        of(response)
    );

    component.getFile();
    fixture.detectChanges();
    expect(component.fileItemExists).toBeTrue;
    expect(component.fileSource).toEqual(APP_SETTINGS.API_ROOT + 'Files/0/Item');
    expect(component.file.name).toEqual("testFile");
    expect(component.form.get('name').value).toEqual("testFile");
  });

  it('should detect that file does not exist', () => {
    const response = {FileName: "testFile", Length : 0};
    
    spyOn(component.siteService, 'getFileItem').and.returnValue(
        of(response)
    );

    component.getFile();
    fixture.detectChanges();
    expect(component.fileItemExists).toBeFalse;
  });

  it('should get approval and data file info', () => {
    component.file.filetype_id = 2;
    component.file.data_file_id = 0;
    const approvalResponse = {approval_date: "2022-02-09T12:00:00.000", member_id: 1};
    const memberResponse = {member_id: 1, fname: "John", lname: "Doe"};
    const dfResponse = {elevation_status: "", collect_date: "2022-02-09T12:00:00.000", processor_id: 1};
    
    spyOn(component.siteService, 'getApproval').and.returnValue(
        of(approvalResponse)
    );

    let memberSpy = spyOn(component.siteService, 'getMemberName').and.returnValue(
      of(memberResponse)
    );

    spyOn(component.siteService, 'getDataFile').and.returnValue(
      of(dfResponse)
    );

    component.setFileType();
    fixture.detectChanges();
    expect(memberSpy).toHaveBeenCalledTimes(2);
    expect(component.datafile).toEqual(dfResponse);
    expect(component.approvedOn).toEqual('2022-02-09T12:00:00.000');
    expect(component.approvedBy).toEqual("John Doe");
    expect(component.collectDate).toEqual(dfResponse.collect_date);
    expect(component.processorName).toEqual("John Doe");
  });

  it('should re-upload file', () => {
    component.loading = true;
    component.fileItemExists = false;
    component.fileUploading = true;
    const response = {
      description: "test 24224",
      file_date: "2021-12-06T18:00:00",
      file_id: 1,
      filetype_id: 1,
      name: "test file 24224",
      photo_date: "2021-12-06T18:00:00",
      site_id: 24224,
      source_id: 1,
    }
    
    spyOn(component.fileEditService, 'uploadFile').and.returnValue(
        of(response)
    );

    component.saveFileUpload();
    fixture.detectChanges();
    expect(component.loading).toBeFalse;
    expect(component.fileItemExists).toBeTrue;
    expect(component.fileUploading).toBeFalse;
  });

  it('should update exisiting file', () => {
    let fileSubmission = {File: {}, FULLname: "test", agency_id: 1, elevation_status: "test", filetype_id: 8, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test", file_id: 9999};

    let response = {filetype_id: 8, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test file", file_id: 9999};
    let sourceResponse = { source_name: "test", source_id: 9999}
    spyOn(component.siteEditService, 'postSource').and.returnValue(
      of(sourceResponse)
    );
    spyOn(component.fileEditService, 'updateFile').and.returnValue(
      of(response)
    );
    spyOn(component, 'closeDialog');

    component.saveFile(fileSubmission);
    fixture.detectChanges();

    expect(component.returnData).toEqual({filetype_id: 8, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test file", file_id: 9999});
  });

  it('should add new file (not link)', () => {
    let fileSubmission = {File: {}, FULLname: "test", agency_id: 1, elevation_status: "test", filetype_id: 1, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test", file_id: 9999, collectDate: "2022-12-30T22:55:17.129" };

    let response = {filetype_id: 1, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test file", file_id: 9999};
    let sourceResponse = { source_name: "test", source_id: 9999}
    spyOn(component.siteEditService, 'postSource').and.returnValue(
      of(sourceResponse)
    );
    spyOn(component.fileEditService, 'uploadFile').and.returnValue(
      of(response)
    );
    spyOn(component, 'closeDialog');

    component.createFile(fileSubmission);
    fixture.detectChanges();

    expect(component.returnData).toEqual({filetype_id: 1, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test file", file_id: 9999});
  });

  it('should add new file (link)', () => {
    let fileSubmission = {File: {}, FULLname: "test", agency_id: 1, elevation_status: "test", filetype_id: 8, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test", file_id: 9999, collectDate: "2022-12-30T22:55:17.129" };

    let response = {filetype_id: 8, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test file", file_id: 9999};
    let sourceResponse = { source_name: "test", source_id: 9999}
    spyOn(component.siteEditService, 'postSource').and.returnValue(
      of(sourceResponse)
    );
    spyOn(component.fileEditService, 'addFile').and.returnValue(
      of(response)
    );
    spyOn(component, 'closeDialog');

    component.createFile(fileSubmission);
    fixture.detectChanges();

    expect(component.returnData).toEqual({filetype_id: 8, file_date: "2022-12-30T22:55:17.129", site_id: 24224, description: "test file", file_id: 9999});
  });

  it('should cancel loading and show alert if file update form is invalid', () => {
    component.form.get("filetype_id").setValue(1);
    component.form.get("file_date").setValue("2022-12-30T22:55:17.129");
    component.form.get("FULLname").setValue("test");
    component.form.get("agency_id").setValue(9999);
    component.form.get("description").setValue(null);
    
    let dialogSpy = spyOn(component.dialog, 'open');

    component.submit();
    fixture.detectChanges();

    expect(dialogSpy).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });
});
