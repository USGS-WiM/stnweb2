import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { EventSubmissionComponent } from './event-submission/event-submission.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { AboutComponent } from './about/about.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatBottomSheetModule,
  MatStepperModule,
  MatTreeModule,
} from '@angular/material';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { IceJamService } from './services/ice-jam.service';
import { SiteService } from './services/site.service';
import { CreateSiteComponent } from './create-site/create-site.component';
import { JamTypeService } from './services/jam-type.service';
import { ConfirmComponent } from './confirm/confirm.component';
import { SelectedSiteService } from './services/selected-site.service';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    HomeComponent,
    EventSubmissionComponent,
    SearchDialogComponent,
    LoginComponent,
    RegistrationComponent,
    CreateSiteComponent,
    ConfirmComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatStepperModule,
    ScrollingModule,
    CdkTableModule,
    CdkTreeModule,
    MatTreeModule,
    CommonModule
  ],
  providers: [
    SiteService,
    IceJamService,
    JamTypeService,
    SelectedSiteService
],
  bootstrap: [AppComponent],
  entryComponents: [
    AboutComponent,
    LoginComponent,
    RegistrationComponent,
    CreateSiteComponent,
    ConfirmComponent
  ]
})
export class AppModule { }
