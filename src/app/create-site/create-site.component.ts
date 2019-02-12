import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatSelect } from '@angular/material';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { JamTypeService } from '../services/jam-type.service';
import { JamType } from '../interfaces/jam-type';
import { ConfirmComponent } from '../confirm/confirm.component';
import { SiteService } from '../services/site.service';
import { Site } from '../interfaces/site';

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


// stateFilter: FormControl = new FormControl();



/* const coordinatesForm = this.formBuilder.group({
    location: '',
    type: 'Point',
    coordinates: ''
}); */

/* const locationForm = this.formBuilder.group({
    type: 'Point',
    coordinates: []
}); */

/* buildAddSiteForm() {
  this.addSiteForm = this.formBuilder.group({
    name: '',
    location: this.locationForm,
    state: '',
    county: '',
    riverName: '',
    huc: '',
    usgsid: '',
    ahpsid: '',
    comments: '',
    landmarks: ''
  });
} */

  constructor(
    // public dialog: MatDialog,
    // public addSiteDialogRef: MatDialogRef<CreateSiteComponent>,
    public formBuilder: FormBuilder,
    private dialog: MatDialog,
    private siteService: SiteService
  ) {
    // this.buildAddSiteForm();
   }

  /* onNoClick(): void {
    this.addSiteDialogRef.close();
  } */

  ngOnInit() {

    const coordsArray = this.formBuilder.group({
        0: null,
        1: null
    });

    const locationForm = this.formBuilder.group({
        type: 'Point',
        coordinates: coordsArray
    });

    this.addSiteForm = this.formBuilder.group({
        id: '',
        name: '',
        location: locationForm,
        state: '',
        county: '',
        riverName: '',
        huc: '',
        usgsid: '',
        ahpsid: '',
        comments: '',
        landmarks: ''
      });
  }

  /* this.addSiteForm = this.formBuilder.group({
    name: '',
    location: [],
    state: '',
    county: '',
    riverName: '',
    huc: '',
    usgsid: '',
    ahpsid: '',
    comments: '',
    landmarks: ''
  });
} */
changeState(e) {

    console.log(e);
    this.addSiteForm.get('state').setValue(e);
    console.log(this.addSiteForm.value);
}

  submitEvent(formValue) {

    // this.submitLoading = true;
    // loop through and convert new_organizations
    // if lat/long fields are deleted to blank, update to null to be a valid number type on PATCH
    // transform date for quality_check to the expected format

    // convert start_date and end_date of eventlocations to 'yyyy-MM-dd' before submission
    // can be removed if configure datepicker to output this format (https://material.angular.io/components/datepicker/overview#choosing-a-date-implementation-and-date-format-settings)

    this.siteService.create(formValue)
      .subscribe(
        (site) => {
          // this.submitLoading = false;

          /* this.confirmDialogRef = this.dialog.open(ConfirmComponent,
            {
              disableClose: true,
              data: {
                title: 'Event Saved',
                titleIcon: 'check',
                message: 'Your event was successfully saved. The Event ID is ' + site.id,
                confirmButtonText: 'OK',
                showCancelButton: false
              }
            }
          ); */

          // when user clicks OK, reset the form and stepper using resetStepper()

        },
      );

  }

}
