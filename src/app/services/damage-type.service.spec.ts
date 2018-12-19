import { TestBed } from '@angular/core/testing';

import { DamageTypeService } from './damage-type.service';

describe('DamageTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DamageTypeService = TestBed.get(DamageTypeService);
    expect(service).toBeTruthy();
  });
});
