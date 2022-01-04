import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { AddUserDialogComponent } from './add-user-dialog.component';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '@app/app-routing.module';
import { UserService } from '@app/services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Overlay } from '@angular/cdk/overlay';
import { of } from 'rxjs';
import { ConfirmComponent } from '@app/confirm/confirm.component';


describe('AddUserDialogComponent', () => {
  let component: AddUserDialogComponent;
  let fixture: ComponentFixture<AddUserDialogComponent>;
  let debugElement: DebugElement;
  let mockForm = {fname:"test",
    lname:"test",
    username:"test456",
    email:"ret@gmail.com",
    phone:null,
    emergencyContact:null,
    emergencyContactPhone:null,
    roleID:1,
    password:"YmF0dGxlUGFzc3BvcnQ4Iw==",
    agency: 34}
  const dialogMock = {
    close: () => { },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatSelectModule,
        HttpClientTestingModule,
        MatAutocompleteModule,
        MatDialogModule,
        NoopAnimationsModule,
      ],
      declarations: [AddUserDialogComponent],
      providers: [
        UserService,
        FormBuilder,
        MatDialog,
        MatSnackBar,
        Overlay,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserDialogComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.newUserForm.valid).toBeFalsy();
  });

  it('fname field validity', () => {
    let errors = {};
    let fname = component.newUserForm.controls['fname'];
    errors = fname.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('fname field should be invalid', () => {
    component.newUserForm.get("fname").setValue('');
    expect(component.newUserForm.controls.fname.status).toBe("INVALID");
  });

  it('lname field validity', () => {
    let errors = {};
    let lname = component.newUserForm.controls['lname'];
    errors = lname.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('lname field should be invalid', () => {
    component.newUserForm.get("lname").setValue('');
    expect(component.newUserForm.controls.lname.status).toBe("INVALID");
  });

  it('phone field validity', () => {
    let errors = {};
    let phone = component.newUserForm.controls['phone'];
    errors = phone.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('phone field should be invalid', () => {
    component.newUserForm.get("phone").setValue(78);
    expect(component.newUserForm.controls.phone.status).toBe("INVALID");
  });

  it('agency_id field validity', () => {
    let errors = {};
    let agency_id = component.newUserForm.controls['agency_id'];
    errors = agency_id.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('agency_id field should be invalid', () => {
    component.newUserForm.get("agency_id").setValue('');
    expect(component.newUserForm.controls.agency_id.status).toBe("INVALID");
  });

  it('role_id field validity', () => {
    let errors = {};
    let role_id = component.newUserForm.controls['role_id'];
    errors = role_id.errors || {};

    expect(errors['required']).toBeTruthy();
  });

  it('role_id field should be invalid', () => {
    component.newUserForm.get("role_id").setValue('');
    expect(component.newUserForm.controls.role_id.status).toBe("INVALID");
  });

  it('username field validity', () => {
    let errors = {};
    let username = component.newUserForm.controls['username'];
    errors = username.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('username field should be invalid', () => {
    component.newUserForm.get("username").setValue('');
    expect(component.newUserForm.controls.username.status).toBe("INVALID");
  });

  it('email field validity', () => {
    let errors = {};
    let email = component.newUserForm.controls['email'];
    errors = email.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('email field should be invalid', () => {
    component.newUserForm.get("email").setValue("test");
    expect(component.newUserForm.controls.email.status).toBe("INVALID");
  });

  it('displays an error message for required email field', () => {
    let message = component.getErrorMessage();
    expect(message).toBe("You must enter a value");
  });

  it('displays an error message for invalid text entered in email field', () => {
    component.newUserForm.get("email").setValue("deleteme");
    let message = component.getErrorMessage();
    expect(message).toBe("Not a valid email");
  });

  it('get agency name', () => {
    let data = {
      a_n: 'test agency',
      a_id: 100
    }

    let filter = component.display(data)
    fixture.detectChanges();
    expect(filter).toEqual('test agency');
  });

  it('format phone number', () => {
    let numberDebug = fixture.debugElement.query(By.css('#phone-number'));
    let numberInput = numberDebug.nativeElement as HTMLInputElement;
    let formattedNumber = ''
    let num: string = '234543676';
    let result: string = '';
    for (let char of num) {
      let eventMock = createKeyDownEvent(char);
      numberInput.dispatchEvent(eventMock);
      if (eventMock.defaultPrevented) {
        // invalid char
      } else {
        result = result.concat(char);
        formattedNumber = component.formatPhoneNumber(result)
      }
    }
    numberInput.value = result;
    numberInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(formattedNumber).toEqual('(234) 543-676');
  });

  it('gets input value for phone input and formats first 4 digits', () => {
    const inputField = (<HTMLInputElement>document.getElementById('phone-number'));
    inputField.value = '1234';
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown'); 
    spyOn(event, 'preventDefault');

    inputField.dispatchEvent(event);
    component.phoneNumberFormatter(event);
    
    expect(inputField.value).toEqual('(123) 4');
  });

  it('newUserForm form should be VALID', () => {
    component.newUserForm.get("fname").setValue("Jane");
    component.newUserForm.get("lname").setValue("Doe");
    component.newUserForm.get("username").setValue("jdoe");
    component.newUserForm.get("agency_id").setValue(100);
    component.newUserForm.get("role_id").setValue(1);
    component.newUserForm.get("phone").setValue("(111) 111-1111");
    component.newUserForm.get("email").setValue("deleteme@gmail.com");
    expect(component.newUserForm.status).toBe("VALID");
  });

  it('newUserForm form should be INVALID due to agency being null', () => {
    component.newUserForm.get("fname").setValue("Jane");
    component.newUserForm.get("lname").setValue("Doe");
    component.newUserForm.get("username").setValue("jdoe");
    component.newUserForm.get("agency_id").setValue(null);
    component.newUserForm.get("role_id").setValue(1);
    component.newUserForm.get("phone").setValue("(111) 111-1111");
    component.newUserForm.get("email").setValue("deleteme@gmail.com");
    expect(component.newUserForm.status).toBe("INVALID");
  });

  it('opens the snackbar', () => {
    const message = 'test';
    const action = 'OK';
    const duration = 5000;
    const snackSpy = spyOn(component, 'openSnackBar').and.callThrough();
    component.openSnackBar(message, action, duration);
    fixture.detectChanges();
    expect(snackSpy).toHaveBeenCalled();
  });

  it('submits form', () => {
    let encryptPassword = spyOn(component, 'encryptPassword');
    let setAgencyinForm = spyOn(component, 'setAgencyinForm');
    let postUser = spyOn(component, 'postUser');

    component.onSubmit(mockForm);
    fixture.detectChanges();
    expect(encryptPassword).toHaveBeenCalled();
    expect(setAgencyinForm).toHaveBeenCalled();
    expect(postUser).toHaveBeenCalled();
  });

  it('post a new user', () => {
    let response = {};
    component.newUserForm.get("fname").setValue("Jane");
    component.newUserForm.get("lname").setValue("Doe");
    component.newUserForm.get("username").setValue("jdoe");
    component.newUserForm.get("agency_id").setValue(100);
    component.newUserForm.get("role_id").setValue(1);
    component.newUserForm.get("phone").setValue("(111) 111-1111");
    component.newUserForm.get("email").setValue("deleteme@gmail.com")

    let postSpy = spyOn(component, 'postUser');

    spyOn(component.userService, 'addNewUser').and.returnValue(
      of(response)
    );
    component.postUser(component.newUserForm);
    fixture.detectChanges();
    expect(component.submitLoading).toBeFalse();
    expect(postSpy).toHaveBeenCalled();
  });

  function createKeyDownEvent(value: string, cancelable = true) {
    return new KeyboardEvent('keydown', { key: value, cancelable })
  }
});
