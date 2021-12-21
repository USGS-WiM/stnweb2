import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserManagementComponent } from './user-management.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Role } from '@interfaces/role';
import { Member } from '@interfaces/member';
import { FormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { of } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Agency } from '@app/interfaces/agency';
import { AddUserDialogComponent } from '@app/add-user-dialog/add-user-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  MatAutocompleteModule
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  const dialogMock = {
    close: () => {},
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatTableModule,
        MatInputModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
      declarations: [UserManagementComponent],
      providers: [
        FormBuilder,
        MatSnackBar,
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getRoles and return list of all roles', () => {
    const response: Role[] = [];
    spyOn(component.roleService, 'getAllRoles').and.returnValue(
      of(response)
    );
    component.getRoles();
    fixture.detectChanges();
    expect(component.roles).toEqual(response);
  });

  it('should call getAgencies and return list of all Agencies', () => {
    const response: Agency[] = [];
    spyOn(component.agencyService, 'getAllAgencies').and.returnValue(
      of(response)
    );
    component.getAgencies();
    fixture.detectChanges();
    expect(component.roles).toEqual(response);
  });

  it('should call getUserData and return list of all members', () => {
    const response: Member[] = [];
    spyOn(component.userService, 'getAllUsers').and.returnValue(
      of(response)
    );
    component.getUserData();
    fixture.detectChanges();
    expect(component.users).toEqual(response);
  });

  it('should call setRole and return role name', () => {
    const role_name = "Manager";
    const returnedName = component.setRole(2);
    fixture.detectChanges();
    expect(returnedName).toEqual(role_name);
  });

  it('should initialize table datasources', () => {
    fixture.detectChanges();
    const table = component.userDataSource;
    expect(table).toBeInstanceOf(MatTableDataSource);
  });

  it(`#openNewUserDialog should open the Add User Component inside a MatDialog`, () => {
    spyOn(component.dialog, 'open').and.callThrough();
    component.openNewUserDialog();
    expect(component.dialog.open).toHaveBeenCalledWith(AddUserDialogComponent, {});
    component.dialog.closeAll();
  });
});
