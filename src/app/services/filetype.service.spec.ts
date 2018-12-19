import { TestBed } from '@angular/core/testing';

import { FiletypeService } from './filetype.service';

describe('FiletypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FiletypeService = TestBed.get(FiletypeService);
    expect(service).toBeTruthy();
  });
});
