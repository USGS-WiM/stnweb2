import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResultDetailsComponent } from './result-details.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { SensorService } from '@services/sensor.service';
import { EventService } from '@services/event.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { APP_UTILITIES } from '@app/app.utilities';
import { APP_SETTINGS } from '@app/app.settings';
import { of } from 'rxjs';
import { Event } from '@interfaces/event';
import { Sitefullsensors } from '@interfaces/sitefullsensors';

describe('ResultDetailsComponent', () => {
    let component: ResultDetailsComponent;
    let fixture: ComponentFixture<ResultDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResultDetailsComponent],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                MatTableModule,
                MatIconModule,
                MatPaginatorModule,
                MatButtonModule,
                MatDialogModule,
                MatAutocompleteModule,
                MatSnackBarModule,
                MatInputModule,
                MatSortModule,
                MatAutocompleteModule,
                MatAutocompleteModule,
            ],
            providers: [
                SensorService,
                EventService,
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResultDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize table datasource', () => {
        fixture.detectChanges();
        const table = component.sensorDataSource;
        expect(table).toBeInstanceOf(MatTableDataSource);
    });

    it('should create array of sensors', () => {
        fixture.detectChanges();
        const table = component.sensorDataSource;
        expect(table).toBeInstanceOf(MatTableDataSource);
    });

    it('should call sensor service getSiteFullInstruments and return list of all sensors', async() => {
        const response: Sitefullsensors[] = [];
        let sensorService = TestBed.inject(SensorService);
        spyOn(sensorService, 'getSiteFullInstruments').and.returnValue(
            of(response)
        );
        component.getSiteSensorData();
        fixture.detectChanges();
        expect(component.siteSensors).toEqual(response);
    });

    it('should call event service getAllEvents and return list of all events', async() => {
        const response: Event[] = [];
        let eventService = TestBed.inject(EventService);
        spyOn(eventService, 'getAllEvents').and.returnValue(
            of(response)
        );
        component.getEvents();
        fixture.detectChanges();
        expect(component.allEvents).toEqual(response);
    });
});
