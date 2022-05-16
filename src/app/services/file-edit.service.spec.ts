import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FileEditService } from './file-edit.service';
import { APP_SETTINGS } from '@app/app.settings';

describe('FileEditService', () => {
  let service: FileEditService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FileEditService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should remove a file', () => {
    const mockFile = {file_id: 0, filetype_id: 0};

    service.deleteFile(mockFile.file_id).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
          JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files/0.json'

    );
    req.flush(mockFile);
  });

  it('should upload a file', () => {
    const mockFile = {file_id: 0, filetype_id: 0};

    service.uploadFile(mockFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
          JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files/bytes'

    );
    req.flush(mockFile);
  });

  it('should add a file', () => {
    const mockFile = {file_id: 0, filetype_id: 0};

    service.addFile(mockFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
          JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files.json'

    );
    req.flush(mockFile);
  });

  it('should update a file', () => {
    const mockFile = {file_id: 0, filetype_id: 0};

    service.updateFile(mockFile.file_id, mockFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
          JSON.stringify(mockFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Files/0.json'

    );
    req.flush(mockFile);
  });

  it('should update a datafile', () => {
    const mockDataFile = {file_id: 0, data_file_id: 0};

    service.updateDataFile(mockDataFile.data_file_id, mockDataFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
          JSON.stringify(mockDataFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'DataFiles/0.json'

    );
    req.flush(mockDataFile);
  });

  it('should add a datafile', () => {
    const mockDataFile = {file_id: 0, data_file_id: 0};

    service.addDataFile(mockDataFile).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
          JSON.stringify(mockDataFile)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'DataFiles.json'

    );
    req.flush(mockDataFile);
  });
});
