import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, PatternValidator, AbstractControl } from '@angular/forms/';
import { MatDialog, MatDialogRef, MatSelect } from '@angular/material';
import { MatBottomSheetModule, MatBottomSheet, MatBottomSheetRef } from '@angular/material';

import { MatStepperModule, MatStepper } from '@angular/material/stepper';

import { MatSnackBar } from '@angular/material';

export interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-event-submission',
  templateUrl: './event-submission.component.html',
  styleUrls: ['./event-submission.component.scss']
})
export class EventSubmissionComponent implements OnInit {
  selectedValue: string;
  selectFormControl = new FormControl('', Validators.required);

  checked = false;
  indeterminate = false;

  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  constructor(
    public route: ActivatedRoute,
    public location: Location,
  ) {}

  eventSubmissionForm: FormGroup;
  ngOnInit() {
  }

}


