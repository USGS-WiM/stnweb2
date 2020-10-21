import { TestBed } from '@angular/core/testing';

import { RiverConditionTypeService } from './river-condition-type.service';

describe('RiverConditionTypeService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: RiverConditionTypeService = TestBed.get(
            RiverConditionTypeService
        );
        expect(service).toBeTruthy();
    });
});
