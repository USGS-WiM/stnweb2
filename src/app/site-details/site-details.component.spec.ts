import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SiteDetailsComponent } from './site-details.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { not } from '@angular/compiler/src/output/output_ast';
import { CurrentUserService } from '@services/current-user.service';

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

    it('should call getObjectivePoints and set referenceMarks to response', () => {
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
        expect(component.referenceMarks.length).toEqual(3);
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
});
