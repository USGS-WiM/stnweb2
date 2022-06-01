import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SensorRetrieveComponent } from './sensor-retrieve.component';

describe('SensorRetrieveComponent', () => {
  let component: SensorRetrieveComponent;
  let fixture: ComponentFixture<SensorRetrieveComponent>;

  const dialogMock = {
    close: () => {},
  };

  let data = {
    sensor: 
    {
      data_files: [],
      deploymentType: "Wave Height",
      deployment_type_id: 1,
      eventName: "Test Event",
      event_id: 1,
      files: [],
      housingType: "Pre-Deployed Bracket",
      housing_type_id: 1,
      instCollection: "Air",
      inst_collection_id: 1,
      instrument_id: 1111,
      instrument_status: [{
        instrument_id: 1111,
        instrument_status_id: 11001,
        member_id: 1,
        notes: "test",
        status: "Deployed",
        status_type_id: 3,
        time_stamp: "2022-01-05T01:05:00",
        time_zone: "UTC",
        vdatum: "NAVD88",
      }],
      interval: 0,
      location_description: "Test",
      sensorBrand: "Hobo",
      sensorType: "Pressure Transducer",
      sensor_brand_id: 1,
      sensor_type_id: 1,
      serial_number: "000",
      site_id: 0,
      statusType: "Deployed",
    },
    siteRefMarks: [],
    
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensorRetrieveComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [MatDialogModule, HttpClientTestingModule, MatTableModule],      
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorRetrieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
