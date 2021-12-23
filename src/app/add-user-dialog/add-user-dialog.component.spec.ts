import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AddUserDialogComponent } from './add-user-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
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


describe('AddUserDialogComponent', () => {
  let component: AddUserDialogComponent;
  let fixture: ComponentFixture<AddUserDialogComponent>;
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
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserDialogComponent);
    component = fixture.componentInstance;
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

  /* it('should return an agency id', () => {
    expect(component).toBeTruthy();
  }); */

  /* it("should emit when state autocomplete option selected", () => {
    spyOn(component.selectState, 'emit');
    let state = "Alabama";

    component.stateSelected(state);
    fixture.detectChanges();
    expect(component.selectState.emit).toHaveBeenCalled();
  }); */

  it('get agency name', () => {
    let data = { 
      a_n: 'test agency',
      a_id: 100
    }

    let filter = component.display(data)
    fixture.detectChanges();
    expect(filter).toEqual('test agency');
  });

  /* it('format phone number', () => {
    let number = 2345436767;

    let formattedNumber = component.formatPhoneNumber(number)
    fixture.detectChanges();
    console.log(formattedNumber)
    expect(formattedNumber).toEqual('(234) 543 6767');
  }); */

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
});
