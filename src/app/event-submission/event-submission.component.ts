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
export interface Ice {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-event-submission',
  templateUrl: './event-submission.component.html',
  styleUrls: ['./event-submission.component.scss']
})
export class EventSubmissionComponent implements OnInit {
  selectFormControl = new FormControl('', Validators.required);

  roughness: string[] = ['< 0 ft', '< 0.5 ft', '< 1 ft', '> 1.5 ft'];

  /* latitude: [null, Validators.pattern(this.latitudePattern)]
  longitude: [null, Validators.pattern(this.longitudePattern)] */

  latitudePattern: RegExp = (/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/);
  longitudePattern: RegExp = (/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/);

  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];

  iceconditions: Ice[] = [
    {value: 'steak-0', viewValue: 'Decay'},
    {value: 'pizza-1', viewValue: 'Melting Snow'},
    {value: 'tacos-2', viewValue: 'Melting Ice'},
    {value: 'tacos-2', viewValue: 'Candled Ice'},
    {value: 'tacos-2', viewValue: 'Cracks'},
    {value: 'tacos-2', viewValue: 'Fracturing'},
    {value: 'tacos-2', viewValue: 'Breakup'}
  ];

  constructor(
    public route: ActivatedRoute,
    public location: Location,
  ) {}

  eventSubmissionForm: FormGroup;
  ngOnInit() {
  }

}


