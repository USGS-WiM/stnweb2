import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreatePasswordComponent } from './create-password.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CreatePasswordComponent', () => {
  let component: CreatePasswordComponent;
  let fixture: ComponentFixture<CreatePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [
            FormsModule,
            ReactiveFormsModule,
            MatInputModule,
            MatFormFieldModule,
            RouterTestingModule,
            NoopAnimationsModule,
        ],
        declarations: [CreatePasswordComponent],
        providers: [

        ]
    }).compileComponents();
    component = TestBed.inject(CreatePasswordComponent);
});

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
