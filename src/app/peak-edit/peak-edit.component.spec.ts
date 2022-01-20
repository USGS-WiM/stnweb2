import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeakEditComponent } from './peak-edit.component';

describe('PeakEditComponent', () => {
  let component: PeakEditComponent;
  let fixture: ComponentFixture<PeakEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeakEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeakEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
