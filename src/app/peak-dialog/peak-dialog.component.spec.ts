import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeakDialogComponent } from './peak-dialog.component';

describe('PeakDialogComponent', () => {
  let component: PeakDialogComponent;
  let fixture: ComponentFixture<PeakDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeakDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeakDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
