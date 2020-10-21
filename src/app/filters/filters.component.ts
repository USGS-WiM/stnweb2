import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, PatternValidator, AbstractControl } from '@angular/forms/';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocompleteTrigger } from '@angular/material';
import { Events } from '../interfaces/events';
import { map, startWith } from 'rxjs/operators';
import {SelectedSiteService} from '../services/selected-site.service';
import { EventsService } from '../services/events.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  filtersForm: FormGroup;
  eventsControl: FormControl;
  events;
  filteredEvents;
  selectedEvents = [];
  selectable = true;
  removable = true;
  addOnBlur = true;

  buildFilterForm() {
    this.filtersForm = this.formBuilder.group({
      event_name: null
    });
  }

  constructor(
    private eventsService: EventsService,
    private selectedSiteService: SelectedSiteService,
    public snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.eventsControl = new FormControl();

      this.buildFilterForm();
     }

  ngOnInit() {

    // get events
      this.eventsService.getAllEvents()
        .subscribe(
          events => {
            this.events = events;
            this.filteredEvents = this.eventsControl.valueChanges.pipe(
              startWith(null),
              map(val => this.filter(val, this.events, 'event_name')));

            for (const index in events) {
              if (this.events.some(function (el) {return el === events[index].event_id; })) {
                this.dropdownSetup(this.eventsControl, this.selectedEvents, events[index]);
              }
            }
          }
        );
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  filter(val: any, searchArray: any, searchProperty: string): string[] {
    const realval = val && typeof val === 'object' ? val.searchProperty : val;
    const result = [];
    let lastOption = null;
    for (let i = 0; i < searchArray.length; i++) {
      if (!realval || searchArray[i][searchProperty].toLowerCase().includes(realval.toLowerCase())) {
        if (searchArray[i][searchProperty] !== lastOption) {
          lastOption = searchArray[i][searchProperty];
          result.push(searchArray[i]);
        }
      }
    }
    return result;
  }

  resetFormControl(control) {
    switch (control) {
      case 'eventType': this.eventsControl.reset();
        break;
    }
  }

  removeChip(chip: any, selectedValuesArray: any, control: string): void {
    // Find key of object in selectedValuesArray
    const index = selectedValuesArray.indexOf(chip);
    // If key exists
    if (index >= 0) {
      // Remove key from selectedValuesArray array
      selectedValuesArray.splice(index, 1);
    }
  }

  addChip(event: MatAutocompleteSelectedEvent, selectedValuesArray: any, control: string): void {

    const self = this;
    // Define selection constant
    let alreadySelected = false;
    const selection = event.option.value;
    if (selectedValuesArray.length > 0) {
      // check if the selection is already in the selected array
      for (const item of selectedValuesArray) {
        if (item.id === selection.id) {
          alreadySelected = true;
          this.openSnackBar('Already Selected', 'OK');
        }
      }
      if (alreadySelected === false) {
        // Add selected item to selected array, which will show as a chip
        selectedValuesArray.push(selection);
        // reset the form
        this.resetFormControl(control);
      }
    } else {
      // Add selected item to selected array, which will show as a chip
      selectedValuesArray.push(selection);
      // reset the form
      this.resetFormControl(control);
    }
  }

  clearSelection() {

    this.selectedEvents = [];

  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  dropdownSetup(formControl: FormControl, selectedValues: any, value: any) {
    selectedValues.push(value);
    // this.resetFormControl(formControl);
  }

  /* clearSelection() {

    this.clearDates();
    this.searchForm.reset();
  } */

}
