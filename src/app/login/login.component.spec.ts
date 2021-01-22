import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '@app/app-routing.module';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { Member } from '@interfaces/member';
import { APP_UTILITIES } from '@app/app.utilities';
import { AuthenticationService } from '@app/services/authentication.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CurrentUserService } from '@app/services/current-user.service';
import { APP_SETTINGS } from '@app/app.settings';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    const dialogMock = {
        close: () => {},
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AppRoutingModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                OverlayModule,
                MatDialogModule,
                NoopAnimationsModule,
            ],
            declarations: [LoginComponent],
            providers: [
                FormBuilder,
                AuthenticationService,
                CurrentUserService,
                MatDialog,
                MatSnackBar,
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(`#onSubmitLogin should log in the user`, () => {
        let testFormValue = { username: 'user', password: 'password' };
        const loginResponse: Member = APP_UTILITIES.DUMMY_USER;
        spyOn(component.authenticationService, 'login').and.returnValue(
            of(loginResponse)
        );
        component.onSubmitLogin(testFormValue);
        expect(component.returnedUser).toEqual(APP_UTILITIES.DUMMY_USER);
    });

    it(`#onSubmitLogout should log out the user`, () => {
        // first login a user so we can know that logout changes the state
        let testFormValue = { username: 'user', password: 'password' };
        const loginResponse: Member = APP_UTILITIES.DUMMY_USER;
        spyOn(component.authenticationService, 'login').and.returnValue(
            of(loginResponse)
        );
        component.onSubmitLogin(testFormValue);
        expect(component.returnedUser).toEqual(APP_UTILITIES.DUMMY_USER);
        spyOn(component.authenticationService, 'logout').and.returnValue(
            of(null)
        );
        component.onSubmitLogout();
        expect(component.returnedUser).toBeNull();
    });
});
