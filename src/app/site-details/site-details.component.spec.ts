import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SiteDetailsComponent } from './site-details.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { not } from '@angular/compiler/src/output/output_ast';
import { CurrentUserService } from '@services/current-user.service';
import { MatMenuModule } from '@angular/material/menu';

declare let L: any;
import 'leaflet';

describe('SiteDetailsComponent', () => {
    let component: SiteDetailsComponent;
    let fixture: ComponentFixture<SiteDetailsComponent>;
    const dialogMock = {
        close: () => {},
    };

    const fakeActivatedRoute = {
        params: of({
            id: 2,
          }),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SiteDetailsComponent],
            providers: [
                { provide: ActivatedRoute, useValue: fakeActivatedRoute },
                { provide: MatDialogRef, useValue: dialogMock },
                CurrentUserService,
            ],
            imports: [HttpClientTestingModule,
                MatDialogModule,
                MatProgressSpinnerModule,
                MatExpansionModule,
                MatCardModule,
                MatTableModule,
                MatTabsModule,
                NoopAnimationsModule,
                MatSortModule,
                MatPaginatorModule,
                MatMenuModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SiteDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getCurrentEvent and return current event', () => {
        const response: any[] = [];
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.currentEvent).toEqual(response);
    });

    it('should call getSiteEvents and set the current event to event name if not 0', () => {
        const response: any[] = [{event_name: "Hurricane Delta", event_id: 4}];
        const currentEvent = 4;
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(currentEvent)
        )
        spyOn(component.siteService, 'getSiteEvents').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.event).toEqual("Hurricane Delta");
    });

    it('should call getSiteEvents and set the current event to "All Events" if not 0', () => {
        const response: any[] = [];
        const currentEvent = 0;
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(currentEvent)
        )
        spyOn(component.siteService, 'getSiteEvents').and.returnValue(
            of(response)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.event).toEqual("All Events");
    });

    it('if getSingleSite response length > 0, other siteService methods should be called', () => {
        const response: any[] = [{site_id: 4}];
        // Single site spy
        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(response)
        );
        // Site service spies
        let hDatumSpy = spyOn(component.siteService, 'getHDatum').and.returnValue(of([]));
        let hCollectionMethodSpy = spyOn(component.siteService, 'getHCollectionMethod').and.returnValue(of([]));
        let networkNameSpy = spyOn(component.siteService, 'getNetworkName').and.returnValue(of([]));
        let networkTypeSpy = spyOn(component.siteService, 'getNetworkType').and.returnValue(of([]));
        let opSpy = spyOn(component.siteService, 'getObjectivePoints').and.returnValue(of([]));
        let peakSpy = spyOn(component.siteService, 'getPeakSummaryView').and.returnValue(of([]));
        component.getData();
        fixture.detectChanges();
        expect(component.site).toEqual(response);
        expect(component.noSiteInfo).toBeFalse;
        expect(hDatumSpy).toHaveBeenCalled();
        expect(hCollectionMethodSpy).toHaveBeenCalled();
        expect(networkNameSpy).toHaveBeenCalled();
        expect(networkTypeSpy).toHaveBeenCalled();
        expect(opSpy).toHaveBeenCalled();
        expect(peakSpy).toHaveBeenCalled();
    });

    it('if getSingleSite response length = 0, noSiteInfo should be true', () => {
        const response: any[] = [];
        // Single site spy
        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(component.site).toEqual(undefined);
        expect(component.noSiteInfo).toBeTrue;
    });

    it('should call getHDatum and set hdatum to datum name', () => {
        const siteResponse = [{hdatum_id: 4}]
        const response: any[] = [{datum_name: "testDatum", hdatum_id: 4}];

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        spyOn(component.siteService, 'getHDatum').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(component.hdatum).toEqual("testDatum");
    });

    it('should call getHCollectionMethod and set hmethod to method name', () => {
        const siteResponse = {hcollect_method_id: 4}
        const response: any[] = [{hcollect_method: "testMethod", hcollect_method_id: 4}];

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        spyOn(component.siteService, 'getHCollectionMethod').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(component.hmethod).toEqual("testMethod");
    });

    it('should call getNetworkType and set networkType to network type name if response length > 0', () => {
        const siteResponse = [{site: 7}]
        const response: any[] = [{network_type_name: "Test Network Type"}];

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        spyOn(component.siteService, 'getNetworkType').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(component.networkType).toEqual("Test Network Type");
    });

    it('should call getNetworkName and set networkName to network name if response length > 0', () => {
        const siteResponse = [{site: 7}]
        const response: any[] = [{name: "Test Network"}];

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        spyOn(component.siteService, 'getNetworkName').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(component.networkName).toEqual("Test Network");
    });

    it('should call getObjectivePoints and set referenceDatums to response', () => {
        const siteResponse = [{site: 7}]
        const response: any[] = [1, 2, 3];

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        spyOn(component.siteService, 'getObjectivePoints').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(component.referenceDatums.length).toEqual(3);
    });

    it('should call getLandownerContact if site has landownercontact_id', () => {
        const siteResponse = {landownercontact_id: 4};
        const response = {fname: "John", lname: "Smith"};

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        let landownerSpy = spyOn(component.siteService, 'getLandownerContact').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(landownerSpy).toHaveBeenCalled();
        expect(component.landownerContact.fname).toEqual("John");
        expect(component.landownerContact.lname).toEqual("Smith");
    });

    it('should call getMemberName if site has member_id', () => {
        const siteResponse = {member_id: 4};
        const response = {fname: "John", lname: "Smith"};

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        let memberSpy = spyOn(component.siteService, 'getMemberName').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(memberSpy).toHaveBeenCalled();
        expect(component.memberName).toEqual("John Smith");
    });

    it('peaks should be populated if peak results are returned', () => {
        const siteResponse = [{site: 4}];
        const response = [{peak_date: "2020-09-16T16:05:04.931548"}];

        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );

        let peakSpy = spyOn(component.siteService, 'getPeakSummaryView').and.returnValue(
            of(response)
        );

        component.getData();
        fixture.detectChanges();
        expect(peakSpy).toHaveBeenCalled();
        expect(component.peaks.length).toEqual(1);
        expect(component.peaks[0].peak_date).toEqual("09/16/2020");
    });

    it('siteHousing should be populated if site housing results are returned', () => {
        const response = [{housing_type_id: 4}];
        const housingTypeResponse = {type_name: "bracket"};

        spyOn(component.siteService, 'getSiteHousing').and.returnValue(
            of(response)
        );

        spyOn(component.siteService, 'getHousingType').and.returnValue(
            of(housingTypeResponse)
        );

        component.getData();
        fixture.detectChanges();
        expect(component.siteHousing.length).toEqual(1);
        expect(component.siteHousing[0].housingType).toEqual("bracket");
    });

    it('should call services for all site info if no event selected', () => {
        const responseSensor: any[] = [
            {instrument_status:[{time_stamp: "2020-09-16T16:05:04.931548", status: "deployed"}]}, 
            {instrument_status:[{time_stamp: "2020-09-17T16:05:04.931548", status: "deployed"}]}, 
            {instrument_status:[{time_stamp: "2020-09-16T18:05:04.931548", status: "deployed"}]}
        ];
        const responseHWM: any[] = [
            {flag_date: "2020-09-16T25:05:04.931548"}, 
            {flag_date: "2020-09-16T16:05:04.931548"}, 
            {flag_date: "2020-09-15T16:05:04.931548"}
        ]
        const responseSiteFiles: any[] = [
            {file_date: "2020-09-16T16:05:04.931548"}
        ]
        const siteResponse = [{site: 7}]
        const currentEvent = 0;
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(currentEvent)
        )
        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );
        let siteSensorSpy = spyOn(component.siteService, 'getSiteFullInstruments').and.returnValue(
            of(responseSensor)
        );
        let hwmSpy = spyOn(component.siteService, 'getHWM').and.returnValue(
            of(responseHWM)
        );
        let siteFilesSpy = spyOn(component.siteService, 'getSiteFiles').and.returnValue(
            of(responseSiteFiles)
        );
        component.getData();
        fixture.detectChanges();
        expect(siteSensorSpy).toHaveBeenCalled();
        expect(component.siteFullInstruments.length).toEqual(3);
        expect(component.siteFullInstruments[0].statusType).not.toEqual(undefined);
        expect(hwmSpy).toHaveBeenCalled();
        expect(component.hwm.length).toEqual(3);
        expect(component.hwm[0].flag_date).toContain("/");
        expect(component.fileLength).toEqual(responseSiteFiles.length);
    });

    it('should call getSiteFiles and separate values into new arrays for sensor, hwm, site and rm', () => {

        const responseSiteFiles: any[] = [
            {file_date: "2020-09-16T16:05:04.931548", hwm_id: 1},
            {file_date: "2020-09-16T16:05:04.931548", objective_point_id: 2},
            {file_date: "2020-09-16T16:05:04.931548", instrument_id: 3},
            {file_date: "2020-09-16T16:05:04.931548"},
        ]
        const siteResponse = [{site: 7}]
        const currentEvent = 0;
        const sensorFileResponse = 1;
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(currentEvent)
        )
        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );
        spyOn(component.siteService, 'getFileSensor').and.returnValue(
            of(sensorFileResponse)
        );
        let siteFilesSpy = spyOn(component.siteService, 'getSiteFiles').and.returnValue(
            of(responseSiteFiles)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.siteFiles.length).toEqual(1);
        expect(component.hwmFiles.length).toEqual(1);
        expect(component.datumLocFiles.length).toEqual(1);
        expect(component.sensorFiles.length).toEqual(1);
        expect(component.sensorFilesDone).toBeTrue;
        expect(siteFilesSpy).toHaveBeenCalled();
        expect(component.files[0].format_file_date).toContain("/");
        expect(component.files[2].details).not.toEqual(undefined);
    });

    it('should call services for event site info if an event is selected', () => {
        const responseSensor: any[] = [
            {instrument_status:[{time_stamp: "2020-09-16T16:05:04.931548"}]}, 
            {instrument_status:[{time_stamp: "2020-09-17T16:05:04.931548"}]}, 
            {instrument_status:[{time_stamp: "2020-09-16T18:05:04.931548"}]}
        ];
        const responseHWM: any[] = [
            {flag_date: "2020-09-16T25:05:04.931548"}, 
            {flag_date: "2020-09-16T16:05:04.931548"}, 
            {flag_date: "2020-09-15T16:05:04.931548"}
        ]
        const responseSiteFiles: any[] = [
            {file_date: "2020-09-16T16:05:04.931548"}
        ]
        const siteResponse = [{site: 7}]
        const fullSensorResponse = [{sensorBrand: "test", sensorType: "test", instrument_status: []}]
        const currentEvent = 4;
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(currentEvent)
        )
        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );
        let siteSensorSpy = spyOn(component.siteService, 'getSiteEventInstruments').and.returnValue(
            of(responseSensor)
        );
        let fullSensorSpy = spyOn(component.siteService, 'getFullSensor').and.returnValue(
            of(fullSensorResponse)
        );
        let hwmSpy = spyOn(component.siteService, 'getEventHWM').and.returnValue(
            of(responseHWM)
        );
        let siteFilesSpy = spyOn(component.siteService, 'getSiteFiles').and.returnValue(
            of(responseSiteFiles)
        );

        let siteEventFilesSpy = spyOn(component.siteService, 'getSiteEventFiles').and.returnValue(
            of(responseSiteFiles)
        );
        component.getData();
        fixture.detectChanges();
        expect(siteSensorSpy).toHaveBeenCalled();
        expect(component.siteFullInstruments.length).toEqual(3);
        expect(hwmSpy).toHaveBeenCalled();
        expect(component.hwm.length).toEqual(3);
        expect(component.hwm[0].flag_date).toContain("/");
        expect(siteFilesSpy).toHaveBeenCalled();
        expect(siteEventFilesSpy).toHaveBeenCalled();
        expect(fullSensorSpy).toHaveBeenCalled();
        expect(component.fileLength).toEqual(responseSiteFiles.length);
    });

    it('should get deployment and status types if getSiteEventInstruments has length > 0', () => {
        const responseSensor: any[] = [
            {deployment_type_id: 4, instrument_id: 4}
        ];
        const deploymentResponse: any[] = [
            {deployment_type_id: 4, method: "test"}
        ]
        const statusTypeResponse = [{status_type_id: 4, status: "deployed"}];

        const statusResponse = {status_type_id: 4}
        
        const siteResponse = [{site: 7}]
        const currentEvent = 4;
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(currentEvent)
        )
        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );
        let siteSensorSpy = spyOn(component.siteService, 'getSiteEventInstruments').and.returnValue(
            of(responseSensor)
        );
        let deploymentTypeSpy = spyOn(component.siteService, 'getDeploymentTypes').and.returnValue(
            of(deploymentResponse)
        );
        let statusTypeSpy = spyOn(component.siteService, 'getStatusTypes').and.returnValue(
            of(statusTypeResponse)
        );

        let statusSpy = spyOn(component.siteService, 'getStatus').and.returnValue(
            of(statusResponse)
        );

        component.getData();
        fixture.detectChanges();
        expect(siteSensorSpy).toHaveBeenCalled();
        expect(component.siteFullInstruments.length).toEqual(1);
        expect(deploymentTypeSpy).toHaveBeenCalled();
        expect(component.siteFullInstruments[0].deploymentType).toEqual("test");
        expect(statusTypeSpy).toHaveBeenCalled();
        expect(statusSpy).toHaveBeenCalled();
        expect(component.siteFullInstruments[0].statusType).toEqual("deployed");
    });

    it('should call getSiteEventFiles and separate values into new arrays for sensor and hwm', () => {

        const responseSiteFiles: any[] = [
            {file_date: "2020-09-16T16:05:04.931548", hwm_id: 1},
            {file_date: "2020-09-16T16:05:04.931548", objective_point_id: 2},
            {file_date: "2020-09-16T16:05:04.931548", instrument_id: 3},
            {file_date: "2020-09-16T16:05:04.931548"},
        ]
        const siteResponse = [{site: 7}]
        const currentEvent = 4;
        const sensorFileResponse = 1;
        spyOn(component.siteService, 'getCurrentEvent').and.returnValue(
            of(currentEvent)
        )
        spyOn(component.siteService, 'getSingleSite').and.returnValue(
            of(siteResponse)
        );
        spyOn(component.siteService, 'getFileSensor').and.returnValue(
            of(sensorFileResponse)
        );
        let siteEventFilesSpy = spyOn(component.siteService, 'getSiteEventFiles').and.returnValue(
            of(responseSiteFiles)
        );
        component.getData();
        fixture.detectChanges();
        expect(component.hwmFiles.length).toEqual(1);
        expect(component.sensorFiles.length).toEqual(1);
        expect(component.sensorFilesDone).toBeTrue;
        expect(siteEventFilesSpy).toHaveBeenCalled();
        expect(component.files[0].file_date).toContain("/");
        expect(component.files[2].details).not.toEqual(undefined);
    });

    it ('toggleSiteMap should change value to true', () => {
        let mapContainer = document.createElement("div");
        mapContainer.id = "mapContainer";
        document.body.appendChild(mapContainer);
        component.siteMapHidden = false;
        component.toggleSiteMap();
        expect(component.siteMapHidden).toBeTrue;
        document.querySelector("#mapContainer").remove();
    });

    it ('toggleSiteMap should change value to false', () => {
        component.map = L.map;
        let mapContainer = document.createElement("div");
        mapContainer.id = "mapContainer";
        document.body.appendChild(mapContainer);
        component.siteMapHidden = true;

        let createSiteMapSpy = spyOn(component, 'createSiteMap');

        component.toggleSiteMap();
        expect(component.siteMapHidden).toBeFalse;
        expect(createSiteMapSpy).not.toHaveBeenCalled();
        document.querySelector("#mapContainer").remove();
    });

    it ('toggleSiteMap should call createSiteMap if map has not been initialized', () => {
        let mapContainer = document.createElement("div");
        mapContainer.id = "mapContainer";
        document.body.appendChild(mapContainer);
        component.siteMapHidden = true;

        let createSiteMapSpy = spyOn(component, 'createSiteMap');

        component.toggleSiteMap();
        expect(component.siteMapHidden).toBeFalse;
        expect(createSiteMapSpy).toHaveBeenCalled();
        document.querySelector("#mapContainer").remove();
    });

    it ('map should be created when createSiteMap is called', () => {
        component.siteFullInstruments = [
            {deploymentType: "Barometric Pressure"}, 
            {deploymentType: "Temperature"}, 
            {deployementType: "Humidity"},
        ];

        component.hwm = [
            {latitude_dd: "38", longitude_dd: "-79"}, 
            {latitude_dd: "39", longitude_dd: "-80"}, 
            {latitude_dd: "38.5", longitude_dd: "-79"},
        ]

        const response: any[] = [{latitude_dd: 38, longitude_dd: -79, site_no: 8}]

        component.site = {latitude_dd: 44.64, longitude_dd: -89.73};
        let mapContainer = document.createElement("div");
        mapContainer.id = "mapContainer";
        document.body.appendChild(mapContainer);

        let proximitySpy = spyOn(component.siteService, 'getProximitySites').and.returnValue(
            of(response)
        );

        component.createSiteMap();
        expect(component.map).not.toBeNull;
        expect(component.baroSensorVisible).toBeTrue;
        expect(component.thermSensorVisible).toBeTrue;
        expect(component.humiditySensorVisible).toBeTrue;
        expect(proximitySpy).toHaveBeenCalled();
        expect(component.markers.getLayers().length).toEqual(7);
        document.querySelector("#mapContainer").remove();
    });

    it ('toggleNearby should turn nearbySites layer on and off', () => {
        const response: any[] = [{latitude_dd: 38, longitude_dd: -79, site_no: 8}]

        component.site = {latitude_dd: 44.64, longitude_dd: -89.73};
        let mapContainer = document.createElement("div");
        mapContainer.id = "mapContainer";
        document.body.appendChild(mapContainer);

        spyOn(component.siteService, 'getProximitySites').and.returnValue(
            of(response)
        );
        component.nearbyToggled = true;

        component.createSiteMap();
        component.toggleNearby();

        expect(component.map.hasLayer(component.nearbySites)).toEqual(true);

        component.nearbyToggled = false;

        component.toggleNearby();

        expect(component.map.hasLayer(component.nearbySites)).toEqual(false);
        document.querySelector("#mapContainer").remove();
    });

    it ('should compare strings, dates, and numbers', () => {
        let result = component.compare("a", "c", true);
        expect(result).toEqual(-1);

        result = component.compare(1, 3, true);
        expect(result).toEqual(-1);

        result = component.compare(new Date("01/18/2021"), new Date("02/20/2020"), true);
        expect(result).toEqual(1);
    });

    it ('should convert a string to a date', () => {
        let result = component.checkDate('01/20/2021');
        expect(typeof result).toEqual('object');
        expect(result).toEqual(new Date('01/20/2021'))
    });

    it('should initialize table datasources', () => {
        fixture.detectChanges();
        const table = component.sensorDataSource;
        expect(table).toBeInstanceOf(MatTableDataSource);
    });

    it('should sort sensors', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'sensorType', direction: 'asc'};
        component.sensorDataSource.data = [{sensorType: "Pressure Transducer"}, {sensorType: "Meteorological Station"}]
        component.sortSensorData(sort);

        expect(component.sensorDataSource.data).toEqual([{sensorType: "Meteorological Station"}, {sensorType: "Pressure Transducer"}]);

        const sort1: Sort = {active: 'deploymentType', direction: 'asc'};
        component.sensorDataSource.data = [{deploymentType: "Wave Height"}, {deploymentType: "Barometric Pressure"}]
        component.sortSensorData(sort1);

        expect(component.sensorDataSource.data).toEqual([{deploymentType: "Barometric Pressure"}, {deploymentType: "Wave Height"}]);

        const sort2: Sort = {active: 'statusType', direction: 'asc'};
        component.sensorDataSource.data = [{statusType: "Retrieved"}, {statusType: "Deployed"}]
        component.sortSensorData(sort2);

        expect(component.sensorDataSource.data).toEqual([{statusType: "Deployed"}, {statusType: "Retrieved"}]);

        const sort3: Sort = {active: 'serial_number', direction: 'asc'};
        component.sensorDataSource.data = [{serial_number: 18}, {serial_number: 5}]
        component.sortSensorData(sort3);

        expect(component.sensorDataSource.data).toEqual([{serial_number: 5}, {serial_number: 18}]);

        const sort4: Sort = {active: 'eventName', direction: 'asc'};
        component.sensorDataSource.data = [{eventName: "Hurricane Laura"}, {eventName: "Hurricane Delta"}]
        component.sortSensorData(sort4);

        expect(component.sensorDataSource.data).toEqual([{eventName: "Hurricane Delta"}, {eventName: "Hurricane Laura"}]);
    });

    it('should sort HWMs', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'hwm_id', direction: 'asc'};
        component.hwmDataSource.data = [{hwm_id: 18}, {hwm_id: 5}]
        component.sortHWMData(sort);

        expect(component.hwmDataSource.data).toEqual([{hwm_id: 5}, {hwm_id: 18}]);

        const sort1: Sort = {active: 'hwm_label', direction: 'asc'};
        component.hwmDataSource.data = [{hwm_label: "test"}, {hwm_label: "hwmtest"}]
        component.sortHWMData(sort1);

        expect(component.hwmDataSource.data).toEqual([{hwm_label: "hwmtest"}, {hwm_label: "test"}]);

        const sort2: Sort = {active: 'flag_date', direction: 'asc'};
        component.hwmDataSource.data = [{flag_date: "01/21/2021"}, {flag_date: "02/20/2020"}]
        component.sortHWMData(sort2);

        expect(component.hwmDataSource.data).toEqual([{flag_date: "02/20/2020"}, {flag_date: "01/21/2021"}]);

        const sort3: Sort = {active: 'elev_ft', direction: 'asc'};
        component.hwmDataSource.data = [{elev_ft: 18}, {elev_ft: 5}]
        component.sortHWMData(sort3);

        expect(component.hwmDataSource.data).toEqual([{elev_ft: 5}, {elev_ft: 18}]);
    });

    it('should sort peaks', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'peak_stage', direction: 'asc'};
        component.peaksDataSource.data = [{peak_stage: 18}, {peak_stage: 5}]
        component.sortPeaksData(sort);

        expect(component.peaksDataSource.data).toEqual([{peak_stage: 5}, {peak_stage: 18}]);

        const sort1: Sort = {active: 'event_name', direction: 'asc'};
        component.peaksDataSource.data = [{event_name: "Hurricane Laura"}, {event_name: "Hurricane Delta"}]
        component.sortPeaksData(sort1);

        expect(component.peaksDataSource.data).toEqual([{event_name: "Hurricane Delta"}, {event_name: "Hurricane Laura"}]);

        const sort2: Sort = {active: 'peak_date', direction: 'asc'};
        component.peaksDataSource.data = [{peak_date: "01/21/2021"}, {peak_date: "02/20/2020"}]
        component.sortPeaksData(sort2);

        expect(component.peaksDataSource.data).toEqual([{peak_date: "02/20/2020"}, {peak_date: "01/21/2021"}]);
    });

    it('should sort reference datums', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'name', direction: 'asc'};
        component.refMarkDataSource.data = [{name: "test.jpg"}, {name: "datumloctest.png"}]
        component.sortRefMarkData(sort);

        expect(component.refMarkDataSource.data).toEqual([{name: "datumloctest.png"}, {name: "test.jpg"}]);

        const sort1: Sort = {active: 'elev_ft', direction: 'asc'};
        component.refMarkDataSource.data = [{elev_ft: 18}, {elev_ft: 5.4}]
        component.sortRefMarkData(sort1);

        expect(component.refMarkDataSource.data).toEqual([{elev_ft: 5.4}, {elev_ft: 18}]);
    });

    it('should sort reference datum files', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'name', direction: 'asc'};
        component.refMarkFilesDataSource.data = [{name: "test.jpg"}, {name: "datumloctest.png"}]
        component.sortRefMarkFilesData(sort);

        expect(component.refMarkFilesDataSource.data).toEqual([{name: "datumloctest.png"}, {name: "test.jpg"}]);

        const sort1: Sort = {active: 'file_date', direction: 'asc'};
        component.refMarkFilesDataSource.data = [{file_date: "01/21/2021"}, {file_date: "02/20/2020"}]
        component.sortRefMarkFilesData(sort1);

        expect(component.refMarkFilesDataSource.data).toEqual([{file_date: "02/20/2020"}, {file_date: "01/21/2021"}]);

        const sort2: Sort = {active: 'datum_name', direction: 'asc'};
        component.refMarkFilesDataSource.data = [{datum_name: "test"}, {datum_name: "datumtest"}]
        component.sortRefMarkFilesData(sort2);

        expect(component.refMarkFilesDataSource.data).toEqual([{datum_name: "datumtest"}, {datum_name: "test"}]);
    });

    it('should sort site files', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'name', direction: 'asc'};
        component.siteFilesDataSource.data = [{name: "test.jpg"}, {name: "datumloctest.png"}]
        component.sortSiteFilesData(sort);

        expect(component.siteFilesDataSource.data).toEqual([{name: "datumloctest.png"}, {name: "test.jpg"}]);

        const sort1: Sort = {active: 'file_date', direction: 'asc'};
        component.siteFilesDataSource.data = [{file_date: "01/21/2021"}, {file_date: "02/20/2020"}]
        component.sortSiteFilesData(sort1);

        expect(component.siteFilesDataSource.data).toEqual([{file_date: "02/20/2020"}, {file_date: "01/21/2021"}]);
    });

    it('should sort sensor files', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'name', direction: 'asc'};
        component.sensorFilesDataSource.data = [{name: "test.jpg"}, {name: "datumloctest.png"}]
        component.sortSensorFilesData(sort);

        expect(component.sensorFilesDataSource.data).toEqual([{name: "datumloctest.png"}, {name: "test.jpg"}]);

        const sort1: Sort = {active: 'file_date', direction: 'asc'};
        component.sensorFilesDataSource.data = [{file_date: "01/21/2021"}, {file_date: "02/20/2020"}]
        component.sortSensorFilesData(sort1);

        expect(component.sensorFilesDataSource.data).toEqual([{file_date: "02/20/2020"}, {file_date: "01/21/2021"}]);

        const sort2: Sort = {active: 'serial_number', direction: 'asc'};
        component.sensorFilesDataSource.data = [{details: {serial_number: 186}}, {details: {serial_number: 34}}]
        component.sortSensorFilesData(sort2);

        expect(component.sensorFilesDataSource.data).toEqual([{details: {serial_number: 34}}, {details: {serial_number: 186}}]);
    });

    it('should sort HWM files', () => {
        fixture.detectChanges();
        const sort: Sort = {active: 'name', direction: 'asc'};
        component.hwmFilesDataSource.data = [{name: "test.jpg"}, {name: "datumloctest.png"}]
        component.sortHWMFilesData(sort);

        expect(component.hwmFilesDataSource.data).toEqual([{name: "datumloctest.png"}, {name: "test.jpg"}]);

        const sort1: Sort = {active: 'file_date', direction: 'asc'};
        component.hwmFilesDataSource.data = [{file_date: "01/21/2021"}, {file_date: "02/20/2020"}]
        component.sortHWMFilesData(sort1);

        expect(component.hwmFilesDataSource.data).toEqual([{file_date: "02/20/2020"}, {file_date: "01/21/2021"}]);
    });

    it('should open the reference mark dialog', () => {
        let dialogSpy = spyOn(component.dialog, 'open');;

        let row = {date_established: "2020-09-16T16:05:04.931548", date_recovered: "2020-09-17T16:05:04.931548"};
        component.openRefMarkDetailsDialog(row);
        fixture.detectChanges();

        expect(dialogSpy).toHaveBeenCalled();
    });
});
