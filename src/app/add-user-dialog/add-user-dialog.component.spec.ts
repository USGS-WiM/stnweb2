import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AddUserDialogComponent } from './add-user-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '@app/app-routing.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  MatAutocompleteModule
} from '@angular/material/autocomplete';

describe('AddUserDialogComponent', () => {
  let component: AddUserDialogComponent;
  let fixture: ComponentFixture<AddUserDialogComponent>;
  const dialogMock = {
    close: () => {},
};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [
            AppRoutingModule,
            FormsModule,
            ReactiveFormsModule,
            MatAutocompleteModule,
            MatInputModule,
            MatFormFieldModule,
            MatSelectModule,
            HttpClientTestingModule,
            OverlayModule,
            MatDialogModule,
            NoopAnimationsModule,
        ],
        declarations: [AddUserDialogComponent],
        providers: [
            FormBuilder,
            MatDialog,
            MatSnackBar,
            { provide: MatDialogRef, useValue: dialogMock },
            { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    component = TestBed.inject(AddUserDialogComponent);
});

  beforeEach(() => {
      fixture = TestBed.createComponent(AddUserDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it('should create', () => {
      expect(component).toBeTruthy();
  });
});
