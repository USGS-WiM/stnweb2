import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { APP_UTILITIES } from '../app.utilities';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  // Regular Expression to match phone character strings
  phonePattern: RegExp = (/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/)

  userForm: FormGroup;
  editingMode = false;
  showPasswordChange = false;
  user;
  roles;
  agencies;
  options = [];
  filteredOptions: Observable<any[]>;

  buildAddNewUserForm() {
    this.userForm = this.formBuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [null, [Validators.required, Validators.pattern(this.phonePattern)]],
      emergencyContact: null,
      emergencyContactPhone: '',
      agency_id: [null, Validators.required],
      role_id: [null, Validators.required],
      password: this.formBuilder.group({
        password: [''],
        confirmPassword: ['']
      }),
    });
  }

  constructor(
    public userDetailsDialogRef: MatDialogRef<UserDetailsComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { this.buildAddNewUserForm(); }

  ngOnInit(): void {
    this.user = this.data.user_data;
    this.agencies = this.data.agencies;
    this.roles = this.data.roles;
    this.editingMode = this.data.viewOrEdit;
    console.log(this.agencies);
    for (let a in this.agencies) {
      this.options.push({ a_n: this.agencies[a].agency_name, a_id: this.agencies[a].agency_id })
    }

    this.filteredOptions = this.userForm.get('agency_id').valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.agency_name),
      map(agencyname => agencyname ? this._filter(agencyname) : this.options.slice())

    );
    this.updateForm();
    // disabling the form based on if the view or edit button were clicked
    if (this.editingMode === false) {
      this.userForm.disable();
    } else if (this.editingMode === true) {
      return
    }
  }

  /* istanbul ignore next */
  _filter(value: string) {
    return this.options.filter(option => option.a_n.toLowerCase().includes(value.toLowerCase()));
  }

  display(selectedoption) {
    console.log(selectedoption);
    if (typeof selectedoption === 'string') { 
      return selectedoption;
    } else { 
      return selectedoption ? selectedoption.a_n : undefined; 
    }

  }

  // setting form values
  updateForm() {
    this.userForm.get('fname').setValue(this.user.fname);
    this.userForm.get('lname').setValue(this.user.lname);
    this.userForm.get('username').setValue(this.user.username);
    this.userForm.get('email').setValue(this.user.email);
    this.userForm.get('phone').setValue(this.user.phone);
    this.userForm.get('emergencyContact').setValue(this.user.emergency_contact_name);
    this.userForm.get('emergencyContactPhone').setValue(this.user.emergency_contact_phone);
    this.userForm.get('agency_id').setValue(this.user.agency_n);
    this.userForm.get('role_id').setValue(this.user.role_id);
  }

  // if user clicks cancel button then clear the values incase they typed some random stuff
  clearPasswordFields() {
    this.showPasswordChange = false;
    this.userForm.get('password').get('password').setValue('');
    this.userForm.get('password').get('confirmPassword').setValue('');
  }

  // On key down gets value of phone input, sends it to formatter, and then replaces input with formatted value
  phoneNumberFormatter(event: any) {
    if (event !== undefined) {
      return APP_UTILITIES.PHONENUMBERFORMATTER(event);
    }
  }
}
