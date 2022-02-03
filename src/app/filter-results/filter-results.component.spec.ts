import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { FilterResultsComponent } from './filter-results.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { APP_UTILITIES } from '@app/app.utilities';
import { SiteService } from '@app/services/site.service';
import { FiltersService } from '@app/services/filters.service';
import { Site } from '@app/interfaces/site';
import { MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ResultDetailsComponent } from '../result-details/result-details.component';
import { RouterTestingModule } from '@angular/router/testing';
export const mockSitesList: Site[] = APP_UTILITIES.SITES_DUMMY_DATA_LIST;

describe('FilterResultsComponent', () => {
    let component: FilterResultsComponent;
    let fixture: ComponentFixture<FilterResultsComponent>;
    let de: DebugElement;
    const dialogMock = {
        close: () => {},
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FilterResultsComponent],
            imports: [
                HttpClientTestingModule,
                NoopAnimationsModule,
                MatTableModule,
                MatPaginatorModule,
                MatAutocompleteModule,
                MatSnackBarModule,
                MatDialogModule,
                MatInputModule,
                MatSortModule,
                RouterTestingModule,
            ],
            providers: [
                SiteService,
                FiltersService,
                { provide: MatDialogRef, useValue: dialogMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call refreshDataSource', () => {
        component.refreshDataSource();
    });

    it('should initialize sort', () => {
        fixture.detectChanges();
        const sort = component.sort;
        expect(sort).toBeInstanceOf(MatSort);
    });

    it('should initialize table datasource', () => {
        fixture.detectChanges();
        const table = component.dataSource;
        expect(table).toBeInstanceOf(MatTableDataSource);
    });

    it('should sort data', () => {
        component.sortData(component.sort);
        component.sortedData;
    });

    // TODO: Verify sort works
    /* it('should show a sorted table', () => {
        component.ngOnInit();
        const compiled = fixture.debugElement.nativeElement;
        const table = compiled.querySelector('mat-table');
        const button = compiled.querySelectorAll(
            'mat-table, ng-container, mat-header-cell, mat-sort-header-arrow'
        );
        const sortArrow = button[5].querySelector(
            'div > .mat-sort-header-content'
        );
        component.dataSource.data = mockSitesList;
        console.log(component.dataSource.data);
        component.dataSource = new MatTableDataSource<Site>(
            component.dataSource.data
        );
        component.sort = new MatSort();
        console.log(component.dataSource.sort);
        component.dataSource.sort = component.sort;
        component.sort.direction = 'asc';
        sortArrow.click();
        console.log(button[5]);
        fixture.detectChanges();
    }); */

    it('compare function should return 1', () => {
        let testSortObject = { a: 5, b: 2, c: 'isAsc' };

        let comparedObject = component.compare(
            testSortObject['a'],
            testSortObject['b'],
            true
        );
        expect(comparedObject).toEqual(1);
    });
});
