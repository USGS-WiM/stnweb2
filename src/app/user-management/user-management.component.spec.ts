import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserManagementComponent } from './user-management.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Role } from '@interfaces/role';
import { Member } from '@interfaces/member';
import { of } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Agency } from '@app/interfaces/agency';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [UserManagementComponent],
        providers: [
        ],
        imports: [HttpClientTestingModule,
          MatTableModule
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
});
