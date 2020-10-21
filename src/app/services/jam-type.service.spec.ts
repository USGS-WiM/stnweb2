import { TestBed } from '@angular/core/testing';

import { JamTypeService } from './jam-type.service';

describe('JamTypeService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: JamTypeService = TestBed.get(JamTypeService);
        expect(service).toBeTruthy();
    });
});
