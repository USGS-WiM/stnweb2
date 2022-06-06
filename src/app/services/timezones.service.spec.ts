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
    let convertedTime = service.convertTimezone('EST/EDT', dateNoDST);

    expect(convertedTime).toEqual("2022-01-05T06:05:00");

    convertedTime = service.convertTimezone('EST/EDT', dateDST);

    expect(convertedTime).toEqual("2022-05-05T05:05:00");
  });

  it('should convert time to PST', () => {
    let convertedTime = service.convertTimezone('PST/PDT', dateNoDST);

    expect(convertedTime).toEqual("2022-01-05T09:05:00");

    convertedTime = service.convertTimezone('PST/PDT', dateDST);

    expect(convertedTime).toEqual("2022-05-05T08:05:00");
  });

  it('should convert time to CST', () => {
    let convertedTime = service.convertTimezone('CST/CDT', dateNoDST);

    expect(convertedTime).toEqual("2022-01-05T07:05:00");

    convertedTime = service.convertTimezone('CST/CDT', dateDST);

    expect(convertedTime).toEqual("2022-05-05T06:05:00");
  });

  it('should convert time to MST', () => {
    let convertedTime = service.convertTimezone('MST/MDT', dateNoDST);

    expect(convertedTime).toEqual("2022-01-05T08:05:00");

    convertedTime = service.convertTimezone('MST/MDT', dateDST);

    expect(convertedTime).toEqual("2022-05-05T07:05:00");
  });

  it('should return MST/MDT', () => {
    let timezone = service.matchTimezone('MST');

    expect(timezone).toEqual('MST/MDT');
  });

  it('should return EST/EDT', () => {
    let timezone = service.matchTimezone('EST');

    expect(timezone).toEqual('EST/EDT');
  });

  it('should return CST/CDT', () => {
    let timezone = service.matchTimezone('CST');

    expect(timezone).toEqual('CST/CDT');
  });

  it('should return PST/PDT', () => {
    let timezone = service.matchTimezone('PST');

    expect(timezone).toEqual('PST/PDT');
  });
});
