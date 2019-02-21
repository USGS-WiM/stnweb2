import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatSelect } from '@angular/material';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { JamTypeService } from '../services/jam-type.service';
import { JamType } from '../interfaces/jam-type';
import { ConfirmComponent } from '../confirm/confirm.component';
import { SiteService } from '../services/site.service';
import { Site } from '../interfaces/site';
import { MatSnackBar } from '@angular/material';

export interface StateAbbreviations {
    name: string;
    abbreviation: string;
}


@Component({
    selector: 'app-create-site',
    templateUrl: './create-site.component.html',
    styleUrls: ['./create-site.component.scss']
})
export class CreateSiteComponent implements OnInit {

    confirmDialogRef: MatDialogRef<ConfirmComponent>;
    addSiteForm: FormGroup;
    sitesArray: FormArray;
    selectedState: string;
    test: number;
    test1: number;
    submitLoading = false;

    latitudePattern: RegExp = (/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/);
    longitudePattern: RegExp = (/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/);

    // jamTypeResults: JamType[];

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
        // public dialog: MatDialog,
        // public addSiteDialogRef: MatDialogRef<CreateSiteComponent>,
        public formBuilder: FormBuilder,
        private dialog: MatDialog,
        private siteService: SiteService,
        public snackBar: MatSnackBar
    ) {
    }

    ngOnInit() {

        const coordsArray = this.formBuilder.group({
            lat: [null, Validators.pattern(this.latitudePattern)],
            long: [null, Validators.pattern(this.longitudePattern)]
        });

        const locationForm = this.formBuilder.group({
            type: 'Point',
            coordinates: coordsArray
        });

        this.addSiteForm = this.formBuilder.group({
            name: '',
            location: locationForm,
            state: '',
            city: '',
            county: '',
            riverName: '',
            huc: null,
            usgsid: null,
            ahpsid: null,
            comments: null,
            landmarks: null
        });
    }

    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, {
          duration: duration,
        });
      }

    changeState(e) {

        console.log(e);
        this.addSiteForm.get('state').setValue(e);
        console.log(this.addSiteForm);
    }


    submitEvent(formValue) {
        this.submitLoading = true;
        formValue.location.coordinates = [formValue.location.coordinates.lat / 1, formValue.location.coordinates.long / 1];

        console.log(formValue);
        console.log(formValue.location.coordinates);
        // this.submitLoading = true;

        this.siteService.create(formValue)
            .subscribe(
                (site) => {
                    this.submitLoading = false;

                    this.confirmDialogRef = this.dialog.open(ConfirmComponent,
                        {
                            disableClose: true,
                            data: {
                                title: 'Site Saved',
                                titleIcon: 'check',
                                message: 'Your site was successfully saved. The Site ID is ' + site.id,
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
                    this.openSnackBar('Error. Site not Submitted. Error message: ' + error, 'OK', 8000);
                }
            );

    }

}
