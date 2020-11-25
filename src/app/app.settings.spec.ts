import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from './app.settings';

import { APP_UTILITIES } from './app.utilities';

describe('APP_USETTINGS', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [APP_UTILITIES],
            providers: [],
        });
    });

    it('IS_LOGGEDIN returns the correct response', () => {
        expect(APP_SETTINGS.IS_LOGGEDIN).toBeFalse();
        localStorage.setItem('username', 'user');
        localStorage.setItem('password', 'pword');
        expect(APP_SETTINGS.IS_LOGGEDIN).toBeTrue();
    });

    it('AUTH_URL returns the correct response', () => {
        expect(APP_SETTINGS.AUTH_URL).toBe(APP_SETTINGS.API_ROOT + 'login');
    });
});
