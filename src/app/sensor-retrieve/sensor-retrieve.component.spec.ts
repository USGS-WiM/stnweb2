import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorRetrieveComponent } from './sensor-retrieve.component';

describe('SensorRetrieveComponent', () => {
  let component: SensorRetrieveComponent;
  let fixture: ComponentFixture<SensorRetrieveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SensorRetrieveComponent ]
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
