import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SensorRetrieveComponent } from './sensor-retrieve.component';

describe('SensorRetrieveComponent', () => {
  let component: SensorRetrieveComponent;
  let fixture: ComponentFixture<SensorRetrieveComponent>;

  const dialogMock = {
    close: () => {},
  };

  let data;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensorRetrieveComponent ],
      providers: [
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [MatDialogModule, HttpClientTestingModule, MatTableModule],      
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorRetrieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
