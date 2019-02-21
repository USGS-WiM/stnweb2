import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, PatternValidator, AbstractControl } from '@angular/forms/';
import { MatDialog, MatDialogRef, MatSelect } from '@angular/material';
import { MatBottomSheetModule, MatBottomSheet, MatBottomSheetRef } from '@angular/material';
import { CreateSiteComponent } from '../create-site/create-site.component';
import { ConfirmComponent } from '../confirm/confirm.component';

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
import { JamType } from '../interfaces/jam-type';
import { JamTypeService } from '../services/jam-type.service';
import { SelectedSiteService } from '../services/selected-site.service';

export interface Food {
    value: string;
    viewValue: string;
}
export interface Ice {
    value: string;
    viewValue: string;
}
export interface StateAbbreviations {
    name: string;
    abbreviation: string;
}

@Component({
    selector: 'app-event-submission',
    templateUrl: './event-submission.component.html',
    styleUrls: ['./event-submission.component.scss']
})
export class EventSubmissionComponent implements OnInit {
    siteid: string;
    observerID: string;
    eventSubmissionForm: FormGroup;
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
    fileResults: File[];
    jamTypes: JamType[];
    public dateTime: Date;
    public dateTimeIce: Date;
    public dateTimeRiver: Date;
    public dateTimeWeather: Date;
    public dateTimeDamages: Date;
    addSiteDialogRef: MatDialogRef<CreateSiteComponent>;
    confirmDialogRef: MatDialogRef<ConfirmComponent>;
    submitLoading = false;

    // selectFormControl = new FormControl('', Validators.required);

    siteFormArray: FormArray;

    roughness: string[] = ['< 0 ft', '< 0.5 ft', '< 1 ft', '> 1.5 ft'];

    jamTypeResults: JamType[];

    /* latitude: [null, Validators.pattern(this.latitudePattern)]
    longitude: [null, Validators.pattern(this.longitudePattern)] */

    latitudePattern: RegExp = (/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/);
    longitudePattern: RegExp = (/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/);

    stateAbbreviations: StateAbbreviations[] = [
        {
            name: 'Alabama',
            abbreviation: 'AL'
        },
        {
            name: 'Alaska',
            abbreviation: 'AK'
        },
        {
            name: 'American Samoa',
            abbreviation: 'AS'
        },
        {
            name: 'Arizona',
            abbreviation: 'AZ'
        },
        {
            name: 'Arkansas',
            abbreviation: 'AR'
        },
        {
            name: 'California',
            abbreviation: 'CA'
        },
        {
            name: 'Colorado',
            abbreviation: 'CO'
        },
        {
            name: 'Connecticut',
            abbreviation: 'CT'
        },
        {
            name: 'Delaware',
            abbreviation: 'DE'
        },
        {
            name: 'District Of Columbia',
            abbreviation: 'DC'
        },
        {
            name: 'Federated States Of Micronesia',
            abbreviation: 'FM'
        },
        {
            name: 'Florida',
            abbreviation: 'FL'
        },
        {
            name: 'Georgia',
            abbreviation: 'GA'
        },
        {
            name: 'Guam',
            abbreviation: 'GU'
        },
        {
            name: 'Hawaii',
            abbreviation: 'HI'
        },
        {
            name: 'Idaho',
            abbreviation: 'ID'
        },
        {
            name: 'Illinois',
            abbreviation: 'IL'
        },
        {
            name: 'Indiana',
            abbreviation: 'IN'
        },
        {
            name: 'Iowa',
            abbreviation: 'IA'
        },
        {
            name: 'Kansas',
            abbreviation: 'KS'
        },
        {
            name: 'Kentucky',
            abbreviation: 'KY'
        },
        {
            name: 'Louisiana',
            abbreviation: 'LA'
        },
        {
            name: 'Maine',
            abbreviation: 'ME'
        },
        {
            name: 'Marshall Islands',
            abbreviation: 'MH'
        },
        {
            name: 'Maryland',
            abbreviation: 'MD'
        },
        {
            name: 'Massachusetts',
            abbreviation: 'MA'
        },
        {
            name: 'Michigan',
            abbreviation: 'MI'
        },
        {
            name: 'Minnesota',
            abbreviation: 'MN'
        },
        {
            name: 'Mississippi',
            abbreviation: 'MS'
        },
        {
            name: 'Missouri',
            abbreviation: 'MO'
        },
        {
            name: 'Montana',
            abbreviation: 'MT'
        },
        {
            name: 'Nebraska',
            abbreviation: 'NE'
        },
        {
            name: 'Nevada',
            abbreviation: 'NV'
        },
        {
            name: 'New Hampshire',
            abbreviation: 'NH'
        },
        {
            name: 'New Jersey',
            abbreviation: 'NJ'
        },
        {
            name: 'New Mexico',
            abbreviation: 'NM'
        },
        {
            name: 'New York',
            abbreviation: 'NY'
        },
        {
            name: 'North Carolina',
            abbreviation: 'NC'
        },
        {
            name: 'North Dakota',
            abbreviation: 'ND'
        },
        {
            name: 'Northern Mariana Islands',
            abbreviation: 'MP'
        },
        {
            name: 'Ohio',
            abbreviation: 'OH'
        },
        {
            name: 'Oklahoma',
            abbreviation: 'OK'
        },
        {
            name: 'Oregon',
            abbreviation: 'OR'
        },
        {
            name: 'Palau',
            abbreviation: 'PW'
        },
        {
            name: 'Pennsylvania',
            abbreviation: 'PA'
        },
        {
            name: 'Puerto Rico',
            abbreviation: 'PR'
        },
        {
            name: 'Rhode Island',
            abbreviation: 'RI'
        },
        {
            name: 'South Carolina',
            abbreviation: 'SC'
        },
        {
            name: 'South Dakota',
            abbreviation: 'SD'
        },
        {
            name: 'Tennessee',
            abbreviation: 'TN'
        },
        {
            name: 'Texas',
            abbreviation: 'TX'
        },
        {
            name: 'Utah',
            abbreviation: 'UT'
        },
        {
            name: 'Vermont',
            abbreviation: 'VT'
        },
        {
            name: 'Virgin Islands',
            abbreviation: 'VI'
        },
        {
            name: 'Virginia',
            abbreviation: 'VA'
        },
        {
            name: 'Washington',
            abbreviation: 'WA'
        },
        {
            name: 'West Virginia',
            abbreviation: 'WV'
        },
        {
            name: 'Wisconsin',
            abbreviation: 'WI'
        },
        {
            name: 'Wyoming',
            abbreviation: 'WY'
        }
    ];

    constructor(
        public route: ActivatedRoute,
        public location: Location,
        public dialog: MatDialog,
        public formBuilder: FormBuilder,
        private iceJamTypeService: JamTypeService,
        public roughnessTypeService: RoughnessTypeService,
        public selectedSiteService: SelectedSiteService,
        public riverConditionTypeService: RiverConditionTypeService,
        public stageTypeService: StageTypeService,
        public weatherConditionTypeService: WeatherConditionTypeService,
        public damageTypeService: DamageTypeService,
        public iceJamService: IceJamService,
        public snackBar: MatSnackBar
    ) {
        // this.buildEventSubmissionForm();

    }

    // registration dialog
    openSiteDialog(): void {
        // this.addSiteDialogRef.close();
        const dialogRef = this.dialog.open(CreateSiteComponent, {

        });

        dialogRef.afterClosed().subscribe(result => {
        });
    }
    ngOnInit() {
        this.iceJamTypeService.getJamTypes()
            .subscribe(
                jamTypeResults => {
                    this.jamTypeResults = jamTypeResults;
                }
            );


        this.roughnessTypeService.getRoughnessTypes()
            .subscribe(
                roughnessTypes => {
                    this.roughnessTypes = roughnessTypes;
                }
            );

        this.riverConditionTypeService.getRiverConditionTypes()
            .subscribe(
                riverConditionTypes => {
                    this.riverConditionTypes = riverConditionTypes;
                }
            );

        this.stageTypeService.getStageTypes()
            .subscribe(
                stageTypes => {
                    this.stageTypes = stageTypes;
                }
            );

        this.weatherConditionTypeService.getWeatherTypes()
            .subscribe(
                WeatherConditionTypes => {
                    this.WeatherConditionTypes = WeatherConditionTypes;
                }
            );

        this.damageTypeService.getDamageTypes()
            .subscribe(
                damageTypes => {
                    this.damageTypes = damageTypes;
                }
            );

        const coordsArrayUp = this.formBuilder.group({
            latitude: [null, Validators.pattern(this.latitudePattern)],
            longitude: [null, Validators.pattern(this.longitudePattern)]
        });
        const coordsArrayDown = this.formBuilder.group({
            lat: [null, Validators.pattern(this.latitudePattern)],
            long: [null, Validators.pattern(this.longitudePattern)]
        });

        const upstreamLatLong = this.formBuilder.group({
            type: 'Point',
            coordinates: coordsArrayUp
        });
        const downstreamLatLong = this.formBuilder.group({
            type: 'Point',
            coordinates: coordsArrayDown
        });

        const iceConditionsForm = this.formBuilder.group({
            // id: '',
            // iceJamID: '', // might be wrong
            dateTime: '',
            iceConditionTypeID: null,
            measurement: null,
            isEstimated: null,
            isChanging: null,
            comments: null,
            upstreamEndLocation: upstreamLatLong,
            downstreamEndLocation: downstreamLatLong,
            roughnessTypeID: null
        });

        const riverConditionsForm = this.formBuilder.group({
            // id: '',
            // iceJamID: '',
            dateTime: '',
            riverConditionTypeID: null,
            isFlooding: null,
            stageTypeID: null,
            measurement: null,
            isChanging: null,
            comments: null,
        });

        const weatherConditionsForm = this.formBuilder.group({
            // id: '',
            // iceJamID: '',
            dateTime: '',
            weatherConditionTypeID: null,
            measurement: null,
            isEstimated: null,
            isChanging: null,
            comments: null,
        });

        /* const filesForm = this.formBuilder.group({
          id: '',
          fileTypeID: '',
          url: '',
          description: '',
          iceJamID: '',
          damageID: ''
        }); */

        const damagesform = this.formBuilder.group({
            damageTypeID: null,
            dateTimeReported: '',
            description: null
        });

        const jamTypeform = this.formBuilder.group({
            id: null,
            name: '',
            description: null,
            exampleImageURL: null
        });

        this.eventSubmissionForm = this.formBuilder.group({
            // id: '',
            observationDateTime: '',
            jamTypeID: null,
            siteID: null,
            observerID: null, // should auto populate
            description: null,
            comments: null,
            type: jamTypeform,
            damages: damagesform,
            // files: filesForm,
            iceConditions: iceConditionsForm,
            riverConditions: riverConditionsForm,
            weatherConditions: weatherConditionsForm
        });

        // selected site is stored in session storage on the home page.
        this.siteid = sessionStorage.getItem('selectedSite');
        this.observerID = sessionStorage.getItem('observerID');

        this.eventSubmissionForm.get('siteID').setValue(this.siteid);
        this.eventSubmissionForm.get('observerID').setValue(this.observerID);
    }

    selectedtype(selected) {
        this.eventSubmissionForm.get('jamTypeID').setValue(selected);

        switch (selected) {
            case selected = 1: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Freezeup' } });
                break;
            }
            case selected = 2: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Aufeis' } });
                break;
            }
            case selected = 3: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Anchor Ice' } });
                break;
            }
            case selected = 4: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Breakup' } });
                break;
            }
            case selected = 5: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Combination' } });
                break;
            }
            case selected = 6: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Released' } });
                break;
            }
            case selected = 7: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Closure' } });
                break;
            }
            case selected = 8: {
                this.eventSubmissionForm.patchValue({ type: { name: 'Uknown' } });
                break;
            }
            default: {
                this.eventSubmissionForm.patchValue({ type: { name: '' } });
                break;
            }
        }
    }

    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, {
          duration: duration,
        });
      }

    submitEvent(formValue) {
        this.submitLoading = true;
        formValue.iceConditions.upstreamEndLocation.coordinates = [
            formValue.iceConditions.upstreamEndLocation.coordinates.latitude / 1,
            formValue.iceConditions.upstreamEndLocation.coordinates.longitude / 1
        ];



        formValue.iceConditions.downstreamEndLocation.coordinates = [
            formValue.iceConditions.downstreamEndLocation.coordinates.lat / 1,
            formValue.iceConditions.downstreamEndLocation.coordinates.long / 1
        ];

        // converting ids from string to number value
        /* formValue.siteID = formValue.siteID / 1;
        formValue.observerID = formValue.siteID / 1; */

        console.log(formValue);
        this.iceJamService.create(formValue)
            .subscribe(
                (sitevisit) => {
                    this.submitLoading = false;

                    this.confirmDialogRef = this.dialog.open(ConfirmComponent,
                        {
                            disableClose: true,
                            data: {
                                title: 'Site visit saved',
                                titleIcon: 'check',
                                message: 'Your site visit was successfully saved. The ID is ' + sitevisit.id,
                                confirmButtonText: 'OK',
                                showCancelButton: false
                            }
                        }
                    );

                    // when user clicks OK, reset the form and stepper using resetStepper()
                    this.confirmDialogRef.afterClosed().subscribe(result => {
                        if (result === true) {
                            // temporarily disabling the resetStepper function in favor of full page reload.
                            // tons of issues with resetting this form because of its complexity. full page reload works for now.
                            // this.resetStepper();
                            location.reload();
                        }
                    });

                },
                error => {
                    this.submitLoading = false;
                    this.openSnackBar('Error. Site Visit not Submitted. Error message: ' + error, 'OK', 8000);
                }
            );

    }
}


