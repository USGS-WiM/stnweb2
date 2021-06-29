import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  MatAutocompleteModule
} from '@angular/material/autocomplete';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FilterComponent } from './filter.component';
import { Event } from '@interfaces/event';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterComponent ],
      imports: [
        HttpClientTestingModule,
        HttpClientTestingModule,
        MatAutocompleteModule,
        MatOptionModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
    ], schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displayEventState returns the appropriate response', () => {
    let state = {
        counties: null,
        selected: true,
        state_abbrev: 'AK',
        state_id: 2,
        state_name: 'Alaska',
    };
    let response = component.displayEventState(state);
    expect(response).toEqual(state && state.state_name);
  });

  it('#display event returns the event name', () => {
    const event: Event = {
        event_id: 24,
        event_name: 'Sandy',
        event_start_date: '2012-10-21T04:00:00',
        event_end_date: '2012-10-30T04:00:00',
        event_description: '',
        event_type_id: 2,
        event_status_id: 2,
        event_coordinator: 36,
        instruments: [],
        hwms: [],
    };
    expect(component.displayEvent(event)).toBe('Sandy');
  });

  it("should emit on submit", () => {
    spyOn(component.submitMapFilter, 'emit');

    component.onSubmit();
    fixture.detectChanges();
    expect(component.submitMapFilter.emit).toHaveBeenCalled();
  });

  it("should emit on clear", () => {
    spyOn(component.clearMapFilterForm, 'emit');

    component.onClear();
    fixture.detectChanges();
    expect(component.clearMapFilterForm.emit).toHaveBeenCalled();
  });

  it("should remove active styling on previously selected event types", () => {
    component.onClear();
    fixture.detectChanges();
    expect(component.eventTypeOptions.options.forEach((option) => option.active)).toBeFalsy();
  });

  it("should emit on event filter change", () => {
    spyOn(component.updateEventFilter, 'emit');

    component.onEventChange();
    fixture.detectChanges();
    expect(component.updateEventFilter.emit).toHaveBeenCalled();
  });

  it("should emit when state autocomplete option selected", () => {
    spyOn(component.selectState, 'emit');
    let state = "Alabama";

    component.stateSelected(state);
    fixture.detectChanges();
    expect(component.selectState.emit).toHaveBeenCalled();
  });

  it("should emit when selected state is removed", () => {
    spyOn(component.remove, 'emit');
    let state = "Alabama";

    component.removeState(state);
    fixture.detectChanges();
    expect(component.remove.emit).toHaveBeenCalled();
  });

  it("should emit when state is added to selection", () => {
    spyOn(component.addState, 'emit');
    let state = "Alabama";

    component.add(state);
    fixture.detectChanges();
    expect(component.addState.emit).toHaveBeenCalled();
  });
});
