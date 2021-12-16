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
  filteredOptions: Observable<string[]>;
  roles;
  submitLoading = false;

  // Regular Expression to match phone character strings
  phonePattern: RegExp = (/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/)

  buildAddNewUserForm() {
    this.newUserForm = this.formBuilder.group({
      fname: '',
      lname: '',
      username:  '',
      email: ['', Validators.required, Validators.email],
      phone: [null, Validators.required, Validators.pattern(this.phonePattern)],
      emergencyContact: null,
      emergencyContactPhone: [null, Validators.pattern(this.phonePattern)],
      agency: null,
      roleID: null, 
      password: this.formBuilder.group({
        password: [''],
        confirmPassword: ['']
      }),
    });
}

  constructor(
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private userService: UserService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { this.buildAddNewUserForm() }

  ngOnInit(): void {
    
    this.agencies = this.data.agencies;
    this.roles = this.data.roles;

    for (let a in this.agencies) {
      this.options.push(this.agencies[a].agency_name)
    }
    this.filteredOptions = this.newUserForm.get('agency').valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

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

    // delete the confirm fields for the actual submission
    delete formValue.confirmEmail;
    delete formValue.terms;
    // Copy password to top level
    const password = btoa(formValue.password.password);
    console.log(password);
    delete formValue.password;
    formValue.password = password;

    this.userService.addNewUser(formValue)
      .subscribe(
        (event) => {
          this.submitLoading = false;
          this.dialog.open(ConfirmComponent, {
            data: {
              title: "User Registration Request Successful",
              titleIcon: "check",
              message:
              `Thank you for registering.`,
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
