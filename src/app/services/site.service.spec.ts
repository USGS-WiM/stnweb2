import { HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '@app/app.settings';
import { APP_UTILITIES } from '@app/app.utilities';
import { of, defer } from 'rxjs';
import { Site } from '@app/interfaces/site';

import { SiteService } from './site.service';

export const mockSitesList: Site[] = APP_UTILITIES.SITES_DUMMY_DATA_LIST;

export function responseData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

describe('SiteService', () => {
    let httpTestingController: HttpTestingController;
    let service: SiteService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SiteService, HttpClient],
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(SiteService);
    });
    afterEach(() => {
        httpTestingController.verify();
        TestBed.resetTestingModule();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#getEventSites() should retrieve a list of Event sites from the API', () => {
        service.getEventSites(7).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSitesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.EVENTS + '/' + 7 + '/Sites.json'
        );
        req.flush(mockSitesList);
    });

    it('#getFilteredSites() should retrieve a list of sites based on input query params', () => {
        service
            .getFilteredSites(APP_UTILITIES.FILTERED_SITES_SAMPLE_QUERY_PARAMS)
            .subscribe((results) => {
                expect(results).not.toBe(null);
                expect(JSON.stringify(results)).toEqual(
                    JSON.stringify(mockSitesList)
                );
            });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL +
                '/FilteredSites.json?' +
                APP_UTILITIES.FILTERED_SITES_SAMPLE_QUERY_PARAMS
        );
        req.flush(mockSitesList);
    });

    it('#getAllSites() should retrieve a sites list from the data API', () => {
        service.getAllSites().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSitesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '.json'
        );
        req.flush(mockSitesList);
    });

    it('#getSingleSite() should retrieve a site from the data API', () => {
        service.getSingleSite("7").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSitesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '.json'
        );
        req.flush(mockSitesList);
    });

    it('#getSiteHousing() should retrieve a housing list from the data API', () => {
        let mockSiteHousingList = [
            {
                site_housing_id: 4524,
                site_id: 27112,
                housing_type_id: 1,
                amount: 1,
                last_updated: "2018-09-25T20:46:37.188449",
                last_updated_by: 876,
            }
        ]
        service.getSiteHousing("7").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSiteHousingList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/siteHousings.json'
        );
        req.flush(mockSiteHousingList);
    });

    it('#getHDatum() should retrieve a horizontal datum list from the data API', () => {
        let mockHDatumList = [
            {
                datum_id: 1,
                datum_name: "local control point",
                datum_abbreviation: "local control point",
                hwms: [],
                sites: [],
            }
        ]
        service.getHDatum().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHDatumList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'HorizontalDatums.json'
        );
        req.flush(mockHDatumList);
    });

    it('#getHCollectionMethod() should retrieve a horizontal collection method list from the data API', () => {
        let mockHCollectionMethodList = [
            {
                hcollect_method_id: 1,
                hcollect_method: "Handheld GPS",
                hwms: [],
                sites: [],
            }
        ]
        service.getHCollectionMethod().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHCollectionMethodList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'HorizontalMethods.json'

        );
        req.flush(mockHCollectionMethodList);
    });

    it('#getHousingType() should retrieve a housing type from the data API', () => {
        let mockHousingTypeList = [
            {
                housing_type_id: 5,
                type_name: "Quick Deploy RDG",
                instruments: []          
            }
        ]
        service.getHousingType("5").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHousingTypeList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'HousingTypes/' + 5 + '.json'

        );
        req.flush(mockHousingTypeList);
    });

    it('#getNetworkType() should retrieve a network type from the data API', () => {
        let mockNetworkTypeList = [
            {
                network_type_id: 3,
                network_type_name: "Other",
                network_type_site: []        
            }
        ]
        service.getNetworkType("5").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockNetworkTypeList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 5 + '/NetworkTypes.json'

        );
        req.flush(mockNetworkTypeList);
    });

    it('#getNetworkName() should retrieve a network name from the data API', () => {
        let mockNetworkNameList = [
            {
                network_name_id: 5,
                name: "Coastal Change Hazards (CCH)",
                network_name_site: []        
            }
        ]
        service.getNetworkName("5").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockNetworkNameList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 5 + '/NetworkNames.json'

        );
        req.flush(mockNetworkNameList);
    });

    it('#getLandownerContact() should retrieve a landowner contact from the data API', () => {
        let mockLandownerContactList = [
            {
                fname: "John"
            }
        ]
        service.getLandownerContact("5").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockLandownerContactList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 5 + '/LandOwner.json'

        );
        req.flush(mockLandownerContactList);
    });

    it('#getMemberName() should retrieve a member from the data API', () => {
        let mockMemberNameList = [
            {
                fname: "John",
                lname: "Smith"
            }
        ]
        service.getMemberName("5").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockMemberNameList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Members/' + 5 + '.json'

        );
        req.flush(mockMemberNameList);
    });

    it('#getSiteEvents() should retrieve an event from the data API', () => {
        let mockSiteEventsList = [
            {
                event_id: 31,
                event_name: "Flood Shakedown Test 2015",
                event_start_date: "2015-04-01T04:00:00",
                event_end_date: "2015-04-16T04:00:00",
                event_description: "This is an event to shakedown that all Centers can successfully make a flood report.",
                event_type_id: 1,
                event_status_id: 1,
                event_coordinator: 9,
                last_updated: "2020-08-10T18:32:38.04814",
                last_updated_by: 1,
                instruments: [],
                hwms: [],
            }
        ]
        service.getSiteEvents("5").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSiteEventsList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Events.json?Site=' + 5

        );
        req.flush(mockSiteEventsList);
    });

    it('#getStatusTypes() should retrieve a list of status types from the data API', () => {
        let mockStatusTypesList = [
            {
                status_type_id: 1,
                status: "Deployed",
                instrument_status: [],
            }
        ]
        service.getStatusTypes().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockStatusTypesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'StatusTypes.json'

        );
        req.flush(mockStatusTypesList);
    });

    it('#getStatus() should retrieve the sensor status from the data API', () => {
        let mockStatusList = [
            {
                instrument_status_id: 151,
                status_type_id: 2,
                instrument_id: 27,
                time_stamp: "2013-05-21T23:48:00",
                notes: "",
                time_zone: "UTC",
                member_id: 41
            }
        ]
        service.getStatus("27").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockStatusList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Instruments/' + 27 + '/InstrumentStatus.json'

        );
        req.flush(mockStatusList);
    });

    it('#getObjectivePoints() should retrieve a reference datum list from the data API', () => {
        let mockOPList = [
            {
                objective_point_id: 9169,
                name: "RP-2",
                description: "test",
                elev_ft: 5.832,
                date_established: "2018-03-05T05:00:00",
                op_is_destroyed: 0,
                op_notes: "tst",
                site_id: 24224,
                vdatum_id: 2,
                latitude_dd: 37.974236,
                longitude_dd: -91.738951,
                hdatum_id: 4,
                hcollect_method_id: 0,
                vcollect_method_id: 2,
                op_type_id: 3,
                date_recovered: "2018-03-05T05:00:00",
                unquantified: "1",
                op_quality_id: 2,
                last_updated: "2018-04-30T13:12:11.457213",
                last_updated_by: 1028,
                op_measurements: [],
                op_control_identifier: [],
                files: [],
            }
        ]
        service.getObjectivePoints("7").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockOPList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/ObjectivePoints.json'

        );
        req.flush(mockOPList);
    });

    it('#getSiteFullInstruments() should retrieve a sensor list for the site from the data API', () => {
        let mockSiteFullInstrumentsList = [
            {
                sensorType: "Pressure Transducer",
                deploymentType: "Barometric Pressure",
                instCollection: "Air",
                housingType: "Pre-Deployed Bracket",
                sensorBrand: "Hobo",
                instrument_id: 8864,
                sensor_type_id: 1,
                deployment_type_id: 3,
                location_description: "in a tree",
                serial_number: "1048695",
                housing_serial_number: "12345",
                interval: 30,
                site_id: 24224,
                event_id: 31,
                inst_collection_id: 4,
                housing_type_id: 1,
                sensor_brand_id: 5,
                vented: "No",
                instrument_status: [],
                data_files: [],
                files: [], 
            }
        ]
        service.getSiteFullInstruments("7").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSiteFullInstrumentsList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/SiteFullInstrumentList.json'

        );
        req.flush(mockSiteFullInstrumentsList);
    });

    it('#getSiteEventInstruments() should retrieve the sensor instruments for the site and event from the data API', () => {
        let mockSiteEventInstrumentsList = [
            {
                instrument_id: 8864,
                sensor_type_id: 1,
                deployment_type_id: 3,
                location_description: "in a tree",
                serial_number: "1048695",
                housing_serial_number: "12345",
                interval: 30,
                site_id: 24224,
                event_id: 31,
                inst_collection_id: 4,
                housing_type_id: 1,
                sensor_brand_id: 5,
                vented: "No",
                last_updated: "2019-04-16T20:32:37.195608",
                last_updated_by: 1,
                instrument_status: [],
                data_files: [],
                files: [],
            }
        ]
        service.getSiteEventInstruments("7", "31").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSiteEventInstrumentsList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/Instruments.json?Event=' + 31

        );
        req.flush(mockSiteEventInstrumentsList);
    });

    it('#getDeploymentTypes() should retrieve a list of deployment types from the data API', () => {
        let mockDeploymentTypesList = [
            {
                deployment_type_id: 1,
                method: "Water Level",
                sensor_deployment: [],
                instruments: [],
            }
        ]
        service.getDeploymentTypes().subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockDeploymentTypesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'DeploymentTypes.json'

        );
        req.flush(mockDeploymentTypesList);
    });

    it('#getHWM() should retrieve a list of HWMs from the data API', () => {
        let mockHWMList = [
            {
                hwm_id: 36567,
                waterbody: "Burger Branch",
                site_id: 24224,
                event_id: 31,
                hwm_type_id: 2,
                hwm_quality_id: 5,
                latitude_dd: 37.974236,
                longitude_dd: -91.738951,
                bank: "N/A",
                approval_id: 21188,
                marker_id: 4,
                hcollect_method_id: 4,
                hwm_environment: "Riverine",
                flag_date: "2019-07-16T04:00:00",
                stillwater: 0,
                hdatum_id: 4,
                flag_member_id: 1,
                hwm_label: "no_label",
                last_updated: "2019-07-17T00:22:16.596972",
                last_updated_by: 1,
                files: [],
            }
        ]
        service.getHWM("7").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHWMList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/HWMs.json'

        );
        req.flush(mockHWMList);
    });

    it('#getEventHWM() should retrieve a list of HWMs from the data API', () => {
        let mockHWMList = [
            {
                hwm_id: 36567,
                waterbody: "Burger Branch",
                site_id: 24224,
                event_id: 31,
                hwm_type_id: 2,
                hwm_quality_id: 5,
                latitude_dd: 37.974236,
                longitude_dd: -91.738951,
                bank: "N/A",
                approval_id: 21188,
                marker_id: 4,
                hcollect_method_id: 4,
                hwm_environment: "Riverine",
                flag_date: "2019-07-16T04:00:00",
                stillwater: 0,
                hdatum_id: 4,
                flag_member_id: 1,
                hwm_label: "no_label",
                last_updated: "2019-07-17T00:22:16.596972",
                last_updated_by: 1,
                files: [],
            }
        ]
        service.getEventHWM("7", "31").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHWMList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/EventHWMs.json?Event=' + 31

        );
        req.flush(mockHWMList);
    });

    it('#getSiteFiles() should retrieve a list of all site files from the data API', () => {
        let mockSiteFilesList = [
            {
                file_id: 86409,
                name: "NCCAR12248_9983816_air.csv",
                description: "test",
                file_date: "2018-03-06T15:39:17.263",
                site_id: 24224,
                filetype_id: 2,
                path: "EVENTS/EVENT_31/SITE_24224",
                data_file_id: 6688,
                instrument_id: 8864,
                last_updated: "2018-03-06T15:40:21.715124",
                last_updated_by: 1,
            }
        ]
        service.getSiteFiles("7").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSiteFilesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/Files.json'

        );
        req.flush(mockSiteFilesList);
    });

    it('#getSiteEventFiles() should retrieve a list of site event files from the data API', () => {
        let mockSiteFilesList = [
            {
                file_id: 86409,
                name: "NCCAR12248_9983816_air.csv",
                description: "test",
                file_date: "2018-03-06T15:39:17.263",
                site_id: 24224,
                filetype_id: 2,
                path: "EVENTS/EVENT_31/SITE_24224",
                data_file_id: 6688,
                instrument_id: 8864,
                last_updated: "2018-03-06T15:40:21.715124",
                last_updated_by: 1,
            }
        ]
        service.getSiteEventFiles("7", "31").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSiteFilesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Files.json?Site=' + 7 + '&Event=' + 31

        );
        req.flush(mockSiteFilesList);
    });

    it('#getFileSensor() should retrieve the sensor associated with a file from the data API', () => {
        let mockFileSensorList = [
            {
                file_id: 27538,
                name: "1028480.hobo",
                description: "",
                photo_direction: "",
                file_date: "1905-06-30T00:00:00",
                site_id: 7757,
                filetype_id: 2,
                source_id: 1817,
                path: "EVENTS/EVENT_25/SITE_7757",
                instrument_id: 2431,

            }
        ]
        service.getFileSensor("2431").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockFileSensorList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Files/' + 2431 + '/Instrument.json'

        );
        req.flush(mockFileSensorList);
    });

    it('#getPeakSummaryView() should retrieve the sensor associated with a file from the data API', () => {
        let mockPeaksList = [
            { 
                peak_summary_id: 12983,
                peak_date: "2018-11-28T09:34:00",
                site_id: 24224,
                latitude: 45,
                longitude: -75,
                event_name: "Flood Shakedown Test 2015",
            }
        ]
        service.getPeakSummaryView("7").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockPeaksList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '/' + 7 + '/PeakSummaryView.json'

        );
        req.flush(mockPeaksList);
    });

    it('#getDatumLocFiles() should retrieve reference datums for an objective point ID', () => {
        let mockDatumLocFilesList = [
            {
                objective_point_id: 1687,
                name: "RM1",
                description: "Top of last bolt on guard rail, on east side of River, downstream of River Rd bridge.",
                elev_ft: 7.735,
                date_established: "2014-12-08T00:00:00",
                op_is_destroyed: 0,
                op_notes: "",
                site_id: 4787,
                vdatum_id: 2,
                latitude_dd: 41.034347,
                longitude_dd: -73.597142,
                hdatum_id: 2,
                hcollect_method_id: 1,
                vcollect_method_id: 2,
                op_type_id: 2,
                unquantified: "",
                op_quality_id: 2,
                op_measurements: [],
                op_control_identifier: [],
                files: [],

            }
        ]
        service.getDatumLocFiles("1687").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockDatumLocFilesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'ObjectivePoints/' + 1687 + '/Files.json'

        );
        req.flush(mockDatumLocFilesList);
    });

    it('#getSensorFiles() should retrieve sensor files for an instrument ID', () => {
        let mockSensorFilesList = [
            {
                file_id: 22253,
                name: "SSS-MS-JAC-020WLGR.png",
                description: "",
                photo_direction: "",
                file_date: "2016-05-31T00:00:00",
                site_id: 6685,
                filetype_id: 1,
                source_id: 1809,
                path: "EVENTS/EVENT_18/SITE_6685",
                instrument_id: 1687,
            }
        ]
        service.getSensorFiles("1687").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSensorFilesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Instruments/' + 1687 + '/Files.json'

        );
        req.flush(mockSensorFilesList);
    });

    it('#getHWMFiles() should retrieve HWM files for a hwm ID', () => {
        let mockHWMFilesList = [
            {
                file_id: 52725,
                name: "DSC_0608.JPG",
                description: "HWM",
                file_date: "2016-09-06T21:06:07.606",
                hwm_id: 13922,
                site_id: 16106,
                filetype_id: 1,
                source_id: 2779,
                path: "EVENTS/EVENT_123/SITE_16106",
                photo_date: "2011-11-14T22:06:08",
            }
        ]
        service.getHWMFiles("13922").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHWMFilesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'HWMs/' + 13922 + '/Files.json'

        );
        req.flush(mockHWMFilesList);
    });

    it('#getOPMeasurements() should retrieve OP Measurement info for an instrument ID', () => {
        let mockOPMeasurementsList = [
            {
                op_measurements_id: 4687,
                objective_point_id: 7998,
                instrument_status_id: 13922,
            }
        ]
        service.getOPMeasurements("13922").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockOPMeasurementsList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'InstrumentStatus/' + 13922 + '/OPMeasurements.json'

        );
        req.flush(mockOPMeasurementsList);
    });

    it('#getHWMType() should retrieve HWM Type info for an hwm ID', () => {
        let mockHWMTypeList = [
            { 
                hwm_type_id: 1,
                hwm_type: "Mud",
                hwms: [],
            }
        ]
        service.getHWMType("13922").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHWMTypeList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'HWMs/' + 13922 + '/Type.json'

        );
        req.flush(mockHWMTypeList);
    });

    it('#getHWMMarker() should retrieve HWM Marker info for an hwm ID', () => {
        let mockHWMMarkerList = [
            { 
                marker_id: 6,
                marker1: "Nail and HWM tag",
                hwms: [],
            }
        ]
        service.getHWMMarker("13922").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHWMMarkerList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'HWMs/' + 13922 + '/Marker.json'

        );
        req.flush(mockHWMMarkerList);
    });

    it('#getHWMQuality() should retrieve HWM Quality info for an hwm ID', () => {
        let mockHWMQualityList = [
            { 
                hwm_quality_id: 1,
                hwm_quality: "Excellent: +/- 0.05 ft",
                min_range: 0,
                max_range: 0.05,
                hwms: [],
            }
        ]
        service.getHWMQuality("13922").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockHWMQualityList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'HWMs/' + 13922 + '/Quality.json'

        );
        req.flush(mockHWMQualityList);
    });

    it('#getFileType() should retrieve File type info for a file type ID', () => {
        let mockFileTypeList = [
            {   
                filetype_id: 8,
                filetype: "Link",
                files: [],
            }
        ]
        service.getFileType("8").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockFileTypeList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'FileTypes/' + 8 + '.json'

        );
        req.flush(mockFileTypeList);
    });

    it('#getFileSource() should retrieve file source info for a source ID', () => {
        let mockFileSourceList = [
            {   
                Links: [],
                address: "1770 Corporate Dr. Ste 500",
                agency_id: 4,
                agency_name: "USGS GA",
                city: "Norcross",
                phone: "(000) 000-0000",
                state: "GA",
                zip: "30093",
            }
        ]
        service.getFileSource("1815").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockFileSourceList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Sources/' + 1815 + '/Agencies.json'

        );
        req.flush(mockFileSourceList);
    });

    it('#getSourceName() should retrieve source info for a source ID', () => {
        let mockSourceNameList = [
            {   
                agency_id: 4,
                files: [],
                source_id: 1815,
                source_name: "John Smith",
            }
        ]
        service.getSourceName("1815").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockSourceNameList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'Sources/' + 1815 + '.json'

        );
        req.flush(mockSourceNameList);
    });

    it('#getApproval() should retrieve data file approval info for a data file ID', () => {
        let mockApprovalList = [
            {   
                approval_id: 3460,
                member_id: 870,
                approval_date: "2017-07-28T16:23:38.74937",
            }
        ]
        service.getApproval("3337").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockApprovalList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'DataFiles/' + 3337 + '/Approval.json'

        );
        req.flush(mockApprovalList);
    });

    it('#getDataFile() should retrieve data file info for a data file ID', () => {
        let mockDataFileList = [
            {   
                data_file_id: 3337,
                good_start: "2016-01-22T23:00:00",
                good_end: "2016-01-26T16:00:00",
                processor_id: 870,
                instrument_id: 7053,
                approval_id: 3460,
                collect_date: "2016-02-08T00:00:00",
                elevation_status: "",
                time_zone: "UTC",
            }
        ]
        service.getDataFile("3337").subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockDataFileList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.API_ROOT + 'DataFiles/' + 3337 + '.json'

        );
        req.flush(mockDataFileList);
    });

    it('#getProximitySites() should retrieve data file info for a data file ID', () => {
        let mockProximitySitesList = [
            {   
                site_id: 7711,
                site_no: "MDANN00001",
                site_name: "MDANN00001",
                site_description: "Annapolis City Dock",
                address: "0",
                city: "Annapolis",
                state: "MD",
                zip: "21401",
                other_sid: "SSS-MD-ANN-001WL",
                county: "Anne Arundel County",
                waterbody: "Annapolis Harbor",
                latitude_dd: 38.976833,
                longitude_dd: -76.48505,
                hdatum_id: 2,
                drainage_area_sqmi: 0,
                landownercontact_id: 283,
                priority_id: 1,
                zone: "0",
                is_permanent_housing_installed: "No",
                usgs_sid: "0",
                noaa_sid: "0",
                hcollect_method_id: 1,
                site_notes: "0",
                safety_notes: "0",
                access_granted: "Yes",
                member_id: 0,
                network_name_site: [],
                network_type_site: [],
                objective_points: [],
                instruments: [],
                files: [],
                site_housing: [],
                hwms: [],
            }
        ]
        service.getProximitySites(45, -89, 0.05).subscribe((results) => {
            expect(results).not.toBe(null);
            expect(JSON.stringify(results)).toEqual(
                JSON.stringify(mockProximitySitesList)
            );
        });
        const req = httpTestingController.expectOne(
            APP_SETTINGS.SITES_URL + '.json?Latitude=' + 45 + '&Longitude=' + -89 + '&Buffer=' + 0.05

        );
        req.flush(mockProximitySitesList);
    });
});