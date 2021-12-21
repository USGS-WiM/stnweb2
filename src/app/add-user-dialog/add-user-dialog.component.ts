import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ConfirmComponent} from '@app/confirm/confirm.component';
import { UserService} from '@app/services/user.service';
import { APP_SETTINGS } from '../app.settings';
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
      fname: '',
      lname: '',
      username:  '',
      email: ['', Validators.email],
      phone: [null, Validators.pattern(this.phonePattern)],
      emergencyContact: null,
      emergencyContactPhone: [null, Validators.pattern(this.phonePattern)],
      agency_id: '', 
      role_id: null, 
      password: this.formBuilder.group({
        password: [''],
        confirmPassword: ['']
      }),
    });
}

  constructor(
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private addUserdialogRef: MatDialogRef<AddUserDialogComponent>,
    private userService: UserService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { this.buildAddNewUserForm() }

  ngOnInit(): void {
    console.log(this.newUserForm.get('agency_id').setValue("test"))
    this.agencies = this.data.agencies;
    this.roles = this.data.roles;

    for (let a in this.agencies) {
      this.options.push({ a_n: this.agencies[a].agency_name, a_id: this.agencies[a].agency_id})
    }
    this.filteredOptions = this.newUserForm.get('agency_id').valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.agency_name),
      map(agencyname => agencyname ? this._filter(agencyname) : this.options.slice())
    );
  }

  openDetailsDialog(row): void {
    let dialogWidth;
    if (window.matchMedia('(max-width: 768px)').matches) {
      dialogWidth = '80%';
    }
    else {
      dialogWidth = '30%';
    }
  }

  private _filter(value: string) {
    return this.options.filter(option => option.a_n.toLowerCase().includes(value.toLowerCase()));
  }

  display(selectedoption){
    return selectedoption ? selectedoption.a_n : undefined;
   }

   // formats phone number to display as (111) 111 1111
   formatPhoneNumber(value) {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 9)}`;
  }

  // On key down gets value of phone input, sends it to formatter, and then replaces input with formatted value
  phoneNumberFormatter(event: any) {
    const inputField = (<HTMLInputElement>document.getElementById('phone-number'));
    const formattedInputValue = this.formatPhoneNumber((<HTMLInputElement>document.getElementById('phone-number')).value);
    inputField.value = formattedInputValue;
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

  onSubmit(formValue) {

    // Copy password to top level
    const password = btoa(formValue.password.password);
    delete formValue.password;
    formValue.password = password;

    // copy agency id value to top level
    const agency_id = formValue.agency_id.a_id;
    delete formValue.agency_id;
    formValue.agency_id = agency_id;
    console.log(formValue);
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

}
