import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [HttpClient, HttpHandler ],
    });
    service = TestBed.inject(RoleService);
});

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
