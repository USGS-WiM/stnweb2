import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, PatternValidator, AbstractControl } from '@angular/forms/';
import { MatDialog, MatDialogRef, MatSelect } from '@angular/material';
import { MatBottomSheetModule, MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { CreateSiteComponent } from '../create-site/create-site.component';

import { MatStepperModule, MatStepper } from '@angular/material/stepper';

import { MatSnackBar } from '@angular/material';

import { Site } from '../interfaces/site';
import { SiteService } from '../services/site.service';

// events
import { IceJam } from '../interfaces/ice-jam';
import { IceJamService } from '../services/ice-jam.service';

import { Agency } from '../interfaces/agency';
import { AgencyService } from '../services/agency.service';

import { DamageType } from '../interfaces/damage-type';
import { DamageTypeService } from '../services/damage-type.service';

import { FileType } from '../interfaces/filetype';
import { FiletypeService } from '../services/filetype.service';

import { File } from '../interfaces/file';
import { FileService } from '../services/file.service';

import { IceCondition } from '../interfaces/ice-condition';
import { IceConditionService } from '../services/ice-condition.service';

import { IceConditionType } from '../interfaces/ice-condition-type';
import { IceConditionTypeService } from '../services/ice-condition-type.service';

import { Observer } from '../interfaces/observer';
import { ObserverService } from '../services/observer.service';

import { RiverCondition } from '../interfaces/river-condition';
import { RiverConditionService } from '../services/river-condition.service';

import { RiverConditionType } from '../interfaces/river-condition-type';
import { RiverConditionTypeService } from '../services/river-condition-type.service';

import { RoughnessType } from '../interfaces/roughness-type';
import { RoughnessTypeService } from '../services/roughness-type.service';

import { StageType } from '../interfaces/stage-type';
import { StageTypeService } from '../services/stage-type.service';

import { WeatherCondition } from '../interfaces/weather-condition';
import { WeatherConditionService } from '../services/weather-condition.service';

import { WeatherConditionType } from '../interfaces/weather-condition-type';
import { WeatherConditionTypeService } from '../services/weather-condition-type.service';

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
  eventResults: IceJam[];
  siteResults: Site[];
  weatherConditionsResults: WeatherCondition[];
  WeatherConditionTypes: WeatherConditionType[];
  roughnessTypes: RoughnessType[];
  riverConditionResults: RiverCondition[];
  riverConditionTypes: RiverConditionType[];
  stageTypes: StageType[];
  iceConditionResults: IceCondition[];
  iceConditionTypes: IceConditionType[];
  agencyResults: Agency[];
  damageTypes: DamageType[];
  // damageResults: Damage[];
  fileTypes: FileType[];
  observerResults: Observer[];
  fileResutls: File[];

  addSiteDialogRef: MatDialogRef<CreateSiteComponent>;

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
    public dialog: MatDialog
  ) {}

  eventSubmissionForm: FormGroup;

  // registration dialog
  openSiteDialog(): void {
    // this.addSiteDialogRef.close();
    const dialogRef = this.dialog.open(CreateSiteComponent, {

    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  ngOnInit() {
  }

}


