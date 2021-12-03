import { TestBed } from '@angular/core/testing';
import { defer } from 'rxjs';
import { RoleService } from './role.service';
import { Role } from '@interfaces/role';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '../app.settings';

export function responseData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export const mockRolesList: Role[] = APP_UTILITIES.ROLES_DUMMY_DATA_LIST;

describe('RoleService', () => {
  let httpTestingController: HttpTestingController;
  let service: RoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleService],
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(RoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getAllRoles() should retrieve a states list from the data API', () => {
    service.getAllRoles().subscribe((results) => {
      expect(results).not.toBe(null);
      expect(JSON.stringify(results)).toEqual(
        JSON.stringify(mockRolesList)
      );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.ROLES + '.json'
    );
    req.flush(mockRolesList);
  });
});
