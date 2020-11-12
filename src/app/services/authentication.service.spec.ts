import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { CurrentUserService } from './current-user.service';

describe('AuthenticationService', () => {
    let service: AuthenticationService;

    beforeEach(() => {
        TestBed.configureTestingModule({

            providers: [HttpClient, HttpHandler, CurrentUserService]
        });
        service = TestBed.inject(AuthenticationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#logout should remove user from sessionStorage', () => {
        service.logout();
        const currentUserStorage = sessionStorage.getItem('currentUser');
        expect(currentUserStorage).toBeNull();
    });
});