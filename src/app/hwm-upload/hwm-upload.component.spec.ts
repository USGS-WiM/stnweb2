import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HwmUploadComponent } from './hwm-upload.component';

describe('HwmUploadComponent', () => {
  let component: HwmUploadComponent;
  let fixture: ComponentFixture<HwmUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HwmUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HwmUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
