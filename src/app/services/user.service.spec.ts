
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { of, defer } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Member } from '@app/interfaces/member';
import { UserService } from './user.service';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '@app/app.settings';

export const mockUserList: Member[] = APP_UTILITIES.USERS_DUMMY_DATA_LIST;

export function responseData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('UserService', () => {
  let httpTestingController: HttpTestingController;
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, HttpClient],
      imports: [HttpClientTestingModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
  });
  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getAllUsers() should retrieve a user list from the data API', () => {
    service.getAllUsers().subscribe((results) => {
      expect(results).not.toBe(null);
      expect(JSON.stringify(results)).toEqual(
        JSON.stringify(mockUserList)
      );
    }, error => {
      console.log(error)
    },);
    const req = httpTestingController.expectOne(
      APP_SETTINGS.USERS + '.json'
    );
    req.flush(mockUserList);
  }, );
});
