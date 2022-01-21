import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  userForm: FormGroup;
  editingMode = false;
  user;

  buildAddNewUserForm() {
    this.userForm = this.formBuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      username:  ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: '',
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
    this.updateForm();
    if (this.editingMode === false) {
        this.userForm.disable();
    } else if (this.editingMode === true) {
        return;
    }
  }

  updateForm() {
    this.userForm.get('fname').setValue(this.user.fname);
    this.userForm.get('lname').setValue(this.user.lname);
    this.userForm.get('username').setValue(this.user.username);
    this.userForm.get('email').setValue(this.user.email);
    this.userForm.get('phone').setValue(this.user.phone);
    this.userForm.get('emergencyContact').setValue(this.user.emergency_contact_name);
    this.userForm.get('emergencyContactPhone').setValue(this.user.emergency_contact_phone);
    this.userForm.get('agency_id').setValue(this.user.agency_n);
    this.userForm.get('role_id').setValue(this.user.role_n);
    console.log(this.user);
    console.log(this.userForm);
  }
}
