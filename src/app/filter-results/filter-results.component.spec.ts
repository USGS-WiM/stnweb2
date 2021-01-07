import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FilterResultsComponent } from './filter-results.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterComponent } from '@app/filter/filter.component';
import { SiteService } from '@app/services/site.service';
import { FiltersService } from '@app/services/filters.service';
import { Site } from '@app/interfaces/site';

describe('FilterResultsComponent', () => {
    let component: FilterResultsComponent;
    let fixture: ComponentFixture<FilterResultsComponent>;
    let filtesrService: FiltersService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FilterResultsComponent],
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatSelectModule,
                MatFormFieldModule,
                MatInputModule,
                HttpClientTestingModule,
                MatToolbarModule,
                MatIconModule,
                MatExpansionModule,
                MatCardModule,
                MatTableModule,
                MatPaginatorModule,
                MatButtonModule,
                MatAutocompleteModule,
                MatSnackBarModule,
                MatDialogModule,
                MatTabsModule,
                MatFormFieldModule,
                MatCheckboxModule,
                MatInputModule,
                MatSelectModule,
                MatButtonToggleModule,
                MatRadioModule,
                ReactiveFormsModule,
            ],
            providers: [SiteService, FiltersService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
});
