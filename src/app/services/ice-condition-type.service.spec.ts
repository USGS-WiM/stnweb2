import { TestBed } from '@angular/core/testing';

import { IceConditionTypeService } from './ice-condition-type.service';

describe('IceConditionTypeService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: IceConditionTypeService = TestBed.get(
            IceConditionTypeService
        );
        expect(service).toBeTruthy();
    });
});
