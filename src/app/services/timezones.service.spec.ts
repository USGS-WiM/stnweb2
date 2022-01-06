import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';

import { TimezonesService } from './timezones.service';

describe('TimezonesService', () => {
  let service: TimezonesService;
  let dateNoDST = "2022-01-05T01:05:00";
  let dateDST = "2022-05-05T01:05:00";

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimezonesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert time to EST', () => {
    let convertedTime = service.convertTimezone('EST/EDT', dateNoDST , "05");

    expect(convertedTime).toEqual("2022-01-05T06:05:00");

    convertedTime = service.convertTimezone('EST/EDT', dateDST , "05");

    expect(convertedTime).toEqual("2022-05-05T05:05:00");
  });

  it('should convert time to PST', () => {
    let convertedTime = service.convertTimezone('PST/PDT', dateNoDST , "05");

    expect(convertedTime).toEqual("2022-01-05T09:05:00");

    convertedTime = service.convertTimezone('PST/PDT', dateDST , "05");

    expect(convertedTime).toEqual("2022-05-05T08:05:00");
  });

  it('should convert time to CST', () => {
    let convertedTime = service.convertTimezone('CST/CDT', dateNoDST , "05");

    expect(convertedTime).toEqual("2022-01-05T07:05:00");

    convertedTime = service.convertTimezone('CST/CDT', dateDST , "05");

    expect(convertedTime).toEqual("2022-05-05T06:05:00");
  });

  it('should convert time to MST', () => {
    let convertedTime = service.convertTimezone('MST/MDT', dateNoDST , "05");

    expect(convertedTime).toEqual("2022-01-05T08:05:00");

    convertedTime = service.convertTimezone('MST/MDT', dateDST , "05");

    expect(convertedTime).toEqual("2022-05-05T07:05:00");
  });
});
