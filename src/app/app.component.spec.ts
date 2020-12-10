import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { CurrentUserService } from '@services/current-user.service';
import { AboutComponent } from '@app/about/about.component';
import { LoginComponent } from '@app/login/login.component';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
    let component: AppComponent;
    // let dialogSpy: jasmine.Spy;
    // let dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    // dialogRefSpyObj.componentInstance = { body: '' }; // attach componentInstance to the spy object...

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatDialogModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
            ],
            declarations: [AppComponent],
            providers: [
                AppComponent,
                CurrentUserService,
                FormBuilder,
                { provide: MatDialogRef, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        component = TestBed.inject(AppComponent);
        // dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'STN'`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.title).toEqual('STN');
    });

    it(`#openAboutDialog should open the About Component inside a MatDialog`, () => {
        spyOn(component.dialog, 'open').and.callThrough();
        component.openAboutDialog();
        expect(component.dialog.open).toHaveBeenCalledWith(AboutComponent, {});
        component.dialog.closeAll();
    });

    it(`#openLoginDialog should open the Login Component inside a MatDialog`, () => {
        spyOn(component.dialog, 'open').and.callThrough();
        component.openLoginDialog();
        expect(component.dialog.open).toHaveBeenCalledWith(LoginComponent, {});
        component.dialog.closeAll();
    });

    it(`#logout should remove user data from localStorage`, () => {
        component.logout();
        expect(localStorage.getItem('username')).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
    });
});
