import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefDatumEditComponent } from './ref-datum-edit.component';

describe('RefDatumEditComponent', () => {
  let component: RefDatumEditComponent;
  let fixture: ComponentFixture<RefDatumEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefDatumEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefDatumEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
