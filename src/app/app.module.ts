import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { AboutComponent } from './about/about.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

// import { MatAccordion } from '@angular/material/expansion';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { CurrentUserService } from '@services/current-user.service';
import { AuthenticationService } from '@services/authentication.service';
import { EventsService } from '@services/events.service';
import { UserService } from '@services/user.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
    declarations: [
        AppComponent,
        AboutComponent,
        HomeComponent,
        SearchDialogComponent,
        LoginComponent,
        RegistrationComponent,
        ConfirmComponent,
    ],
    imports: [
        BrowserModule,
        RouterModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ScrollingModule,
        CdkTableModule,
        CdkTreeModule,
        CommonModule,
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
        //MatAccordion,
    ],
    schemas:  [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        CurrentUserService,
        AuthenticationService,
        EventsService,
        UserService,
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        AboutComponent,
        LoginComponent,
        RegistrationComponent,
        ConfirmComponent,
    ]
})
export class AppModule {}
