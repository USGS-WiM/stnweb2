import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ConfirmComponent} from '@app/confirm/confirm.component';
import { UserService} from '@app/services/user.service';
import { APP_SETTINGS } from '../app.settings';
import { APP_UTILITIES } from '../app.utilities';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {
  newUserForm: FormGroup;
  options = [];
  agencies;
  filteredOptions: Observable<any[]>;
  roles;
  submitLoading = false;

  // Regular Expression to match phone character strings
  phonePattern: RegExp = (/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/)

  buildAddNewUserForm() {
    this.newUserForm = this.formBuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      username:  ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(this.phonePattern)]],
      emergencyContact: null,
      emergencyContactPhone: [null, Validators.pattern(this.phonePattern)],
      agency_id: [null, Validators.required], 
      role_id: [null, Validators.required], 
      password: this.formBuilder.group({
        password: [''],
        confirmPassword: ['']
      }),
    });
}

  constructor(
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    public addUserdialogRef: MatDialogRef<AddUserDialogComponent>,
    public userService: UserService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { this.buildAddNewUserForm() }

  ngOnInit(): void {
    this.agencies = this.data.agencies;
    this.roles = this.data.roles;
    console.log(this.agencies);
    for (let a in this.agencies) {
      this.options.push({ a_n: this.agencies[a].agency_name, a_id: this.agencies[a].agency_id})
    }

    this.filteredOptions = this.newUserForm.get('agency_id').valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.agency_name),
      map(agencyname => agencyname ? this._filter(agencyname)  : this.options.slice())
      
    );
  }

  /* istanbul ignore next */
  _filter(value: string) {
    return this.options.filter(option => option.a_n.toLowerCase().includes(value.toLowerCase()));
  }

  display(selectedoption){
    console.log(selectedoption);
    return selectedoption ? selectedoption.a_n : undefined;
   }

  // On key down gets value of phone input, sends it to formatter, and then replaces input with formatted value
  phoneNumberFormatter(event: any) {
    if (event !== undefined) {
      return APP_UTILITIES.PHONENUMBERFORMATTER(event);
    }
  }

  // snack bar message displayed on service failure
  openSnackBar(message: string, action: string, duration: number) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }

  getErrorMessage() {
    if (this.newUserForm.get('email').hasError('required')) {
      return 'You must enter a value';
    }

    return this.newUserForm.get('email').hasError('email') ? 'Not a valid email' : '';
  }
  
  /* istanbul ignore next */
  encryptPassword(formValue) {
    if (formValue !== undefined) {
    // Copy password to top level
    const password = btoa(formValue.password.password);
    delete formValue.password;
    formValue.password = password;
    }
  }

  /* istanbul ignore next */
  setAgencyinForm(formValue) {
    // copy agency id value to top level
    const agency_id = formValue.agency_id.a_id;
    delete formValue.agency_id;
    formValue.agency_id = agency_id;
  }

  /* istanbul ignore next */
  postUser(formValue) {
    this.userService.addNewUser(formValue)
    .subscribe(
      (event) => {
        this.submitLoading = false;
        this.addUserdialogRef.close();
        this.dialog.open(ConfirmComponent, {
          data: {
            title: "Successfully created User: " + formValue.username,
            titleIcon: "check",
            message:
            `Please ask them to change their password after logging in the first time.`,
            confirmButtonText: "OK",
            showCancelButton: false,
          },
        });
      },
      /* istanbul ignore next */
      error => {

        let parsedError = null;
        try {
          parsedError = JSON.parse(error);
        } catch (error) {
          // Ignore JSON parsing error
        }
        this.submitLoading = false;
        this.openSnackBar('Error. User registration failed. Error message: ' + error, 'OK', 8000);
      }
    );
  }

  onSubmit(formValue) {

    // reformatting password and agencies sections in form
    this.encryptPassword(formValue);
    this.setAgencyinForm(formValue)
    this.postUser(formValue);
    
  }

}
