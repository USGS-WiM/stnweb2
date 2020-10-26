import { Component, OnInit, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA } from '@angular/material';
// import { MatSnackBar } from '@angular/material';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormArray,
    Validators,
    PatternValidator,
    AbstractControl,
} from '@angular/forms/';

import { Events } from '../interfaces/events';
import { map, startWith } from 'rxjs/operators';
import { EventsService } from '../services/events.service';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit {
    filtersForm: FormGroup;
    eventsControl: FormControl;
    events;
    filteredOptions;
    selectedEvents = [];
    selectable = true;
    removable = true;
    addOnBlur = true;
    options = [];

    buildFilterForm() {
        this.filtersForm = this.formBuilder.group({
            event_name: null,
        });
    }

    constructor(
        private eventsService: EventsService,
        // public snackBar: MatSnackBar,
        private formBuilder: FormBuilder // @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.eventsControl = new FormControl();

        this.buildFilterForm();
    }

    ngOnInit() {
        // get events
        // this.eventsService.getAllEvents().subscribe((events) => {
        //     this.events = events;
        //     for (const e in events) {
        //         if (e !== undefined) {
        //             this.options.push(events[e].event_name);
        //         }
        //     }
        //     this.filteredOptions = this.eventsControl.valueChanges.pipe(
        //         startWith(''),
        //         map((value) => this._filter(value))
        //     );
        // });
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter((option) =>
            option.toLowerCase().includes(filterValue)
        );
    }

    resetFormControl(control) {
        switch (control) {
            case 'eventType':
                this.eventsControl.reset();
                break;
        }
    }

    clearSelection() {
        this.selectedEvents = [];
    }

    // openSnackBar(message: string, action: string) {
    //     this.snackBar.open(message, action, {
    //         duration: 2000,
    //     });
    // }

    dropdownSetup(formControl: FormControl, selectedValues: any, value: any) {
        selectedValues.push(value);
        // this.resetFormControl(formControl);
    }
}
