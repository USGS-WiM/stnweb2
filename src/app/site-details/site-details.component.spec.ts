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

    it('should call services for all site info if no event selected', () => {
        const responseSensor: any[] = [{instrument_status:[{time_stamp: "2020-09-16T16:05:04.931548", status: "deployed"}]}, {instrument_status:[{time_stamp: "2020-09-17T16:05:04.931548", status: "deployed"}]}, {instrument_status:[{time_stamp: "2020-09-16T18:05:04.931548", status: "deployed"}]}];
        const responseHWM: any[] = [{flag_date: "2020-09-16T25:05:04.931548"}, {flag_date: "2020-09-16T16:05:04.931548"}, {flag_date: "2020-09-15T16:05:04.931548"}]
        const responseSiteFiles: any[] = []
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
});
