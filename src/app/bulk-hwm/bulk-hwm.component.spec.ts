import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkHwmComponent } from './bulk-hwm.component';

describe('BulkHwmComponent', () => {
  let component: BulkHwmComponent;
  let fixture: ComponentFixture<BulkHwmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkHwmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkHwmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
