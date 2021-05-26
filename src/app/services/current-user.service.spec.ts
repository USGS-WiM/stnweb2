import { TestBed } from '@angular/core/testing';

import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
    let service: CurrentUserService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [CurrentUserService] });
        service = TestBed.inject(CurrentUserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
