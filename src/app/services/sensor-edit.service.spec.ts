import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { APP_SETTINGS } from '@app/app.settings';

import { SensorEditService } from './sensor-edit.service';

describe('SensorEditService', () => {
  let service: SensorEditService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SensorEditService],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SensorEditService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getSensorTypeLookup() should retrieve a list of sensor types from the data API', () => {
    let mockSensorTypesList = [{
      deploymenttypes: [],
      sensor_type_id: 6,
      sensor: "Rain Gage",
      sensor_deployment: [],
      instruments: [],
    }]
    service.getSensorTypeLookup().subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockSensorTypesList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'SensorTypes.json'

    );
    req.flush(mockSensorTypesList);
  });

  it('#getSensorBrandLookup() should retrieve a list of sensor brands from the data API', () => {
    let mockSensorBrandsList = [{
      sensor_brand_id: 1,
      brand_name: "Measurement Specialties",
      instruments: [],
    }]
    service.getSensorBrandLookup().subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockSensorBrandsList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'SensorBrands.json'

    );
    req.flush(mockSensorBrandsList);
  });

  it('#getCollectConditions() should retrieve a list of collection conditions from the data API', () => {
    let mockCollectConditionsList = [{
      id: 1,
      condition: "Saline Water",
      instruments: [],
    }]
    service.getCollectConditions().subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockCollectConditionsList)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'InstrCollectConditions.json'

    );
    req.flush(mockCollectConditionsList);
  });

  it('#putInstrument() should update a sensor', () => {
    let mockInstrument = 
        {
            instrument_id: 0,
        }

    service.putInstrument('0', mockInstrument).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockInstrument)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'Instruments/0.json',
    );
    req.flush(mockInstrument);
  });

  it('#putInstrumentStatus() should update an instrument status', () => {
    let mockInstrumentStatus = 
        {
            instrument_status_id: 0,
        }

    service.putInstrumentStatus('0', mockInstrumentStatus).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockInstrumentStatus)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'InstrumentStatus/0.json',
    );
    req.flush(mockInstrumentStatus);
  });

  it('#deleteOPMeasure() should update an instrument status', () => {
    let mockOPMeasurement = 
        {
            op_measuremenets_id: 0,
        }

    service.deleteOPMeasure('0').subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockOPMeasurement)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'OPMeasurements/0.json',
    );
    req.flush(mockOPMeasurement);
  });

  it('#updateOPMeasure() should update an instrument status', () => {
    let mockOPMeasurement = 
        {
            op_measuremenets_id: 0,
        }

    service.updateOPMeasure('0', mockOPMeasurement).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockOPMeasurement)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'OPMeasurements/0.json',
    );
    req.flush(mockOPMeasurement);
  });

  it('#addOPMeasure() should add an instrument status', () => {
    let mockOPMeasurement = 
        {
            op_measuremenets_id: 0,
        }

    service.addOPMeasure(mockOPMeasurement).subscribe((results) => {
        expect(results).not.toBe(null);
        expect(JSON.stringify(results)).toEqual(
            JSON.stringify(mockOPMeasurement)
        );
    });
    const req = httpTestingController.expectOne(
      APP_SETTINGS.API_ROOT + 'OPMeasurements.json',
    );
    req.flush(mockOPMeasurement);
  });
});
