import { TestBed } from '@angular/core/testing';

import { IceJamService } from './ice-jam.service';

describe('IceJamService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: IceJamService = TestBed.get(IceJamService);
        expect(service).toBeTruthy();
    });
});
