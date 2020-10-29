import { TestBed } from '@angular/core/testing';

import { TestService } from './test.service';

// This file only exists to serve as a template for the latest spec file style
// It should be removed from the repo after its usefulness has expired.
describe('TestService', () => {
    let service: TestService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
