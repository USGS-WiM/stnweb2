import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HwmEditComponent } from './hwm-edit.component';

describe('HwmEditComponent', () => {
  let component: HwmEditComponent;
  let fixture: ComponentFixture<HwmEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HwmEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HwmEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
