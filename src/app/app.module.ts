import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { AboutComponent } from './about/about.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';

import { HighchartsChartModule } from 'highcharts-angular';

// import { MatAccordion } from '@angular/material/expansion';

import { LoginComponent } from './login/login.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { CurrentUserService } from '@services/current-user.service';
import { AuthenticationService } from '@services/authentication.service';
import { EventService } from '@services/event.service';
import { UserService } from '@services/user.service';
import { DisplayValuePipe } from '@pipes/display-value.pipe';
import { SiteService } from '@services/site.service';
import { FiltersService } from '@services/filters.service';
import { FilterResultsComponent } from './filter-results/filter-results.component';
import { FilterComponent } from './filter/filter.component';
import { SiteDetailsComponent } from './site-details/site-details.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { SettingsComponent } from './settings/settings.component';
import { BulkHwmComponent } from './bulk-hwm/bulk-hwm.component';
import { HwmUploadComponent } from './hwm-upload/hwm-upload.component';
import { ResultDetailsComponent } from './result-details/result-details.component';
import { SensorService } from './services/sensor.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReferenceMarkDialogComponent } from './reference-mark-dialog/reference-mark-dialog.component';
import { HwmDialogComponent } from './hwm-dialog/hwm-dialog.component';
import { SensorDialogComponent } from './sensor-dialog/sensor-dialog.component';
import { PeakDialogComponent } from './peak-dialog/peak-dialog.component';
import { FileDetailsDialogComponent } from './file-details-dialog/file-details-dialog.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        MapComponent,
        LoginComponent,
        ConfirmComponent,
        DisplayValuePipe,
        FilterResultsComponent,
        FilterComponent,
        SiteDetailsComponent,
        ApprovalsComponent,
        SettingsComponent,
        BulkHwmComponent,
        HwmUploadComponent,
        ResultDetailsComponent,
        ReferenceMarkDialogComponent,
        HwmDialogComponent,
        SensorDialogComponent,
        PeakDialogComponent,
        FileDetailsDialogComponent,
        UserManagementComponent,
        AddUserDialogComponent,
    ],
    imports: [
        BrowserModule,
        OverlayModule,
        RouterModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        ScrollingModule,
        CdkTableModule,
        CdkTreeModule,
        CommonModule,
        MatToolbarModule,
        MatChipsModule,
        MatIconModule,
        MatExpansionModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatOptionModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTabsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatRadioModule,
        MatMenuModule,
        MatSortModule,
        HighchartsChartModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
    ],
    providers: [
        CurrentUserService,
        AuthenticationService,
        SensorService,
        EventService,
        UserService,
        SiteService,
        FiltersService,
        DisplayValuePipe,
        MatSnackBar,
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        AboutComponent,
        LoginComponent,
        ConfirmComponent,
        ResultDetailsComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
