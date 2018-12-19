import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RegistrationComponent } from '../registration/registration.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm: FormGroup;

  constructor(
    public dialog: MatDialog,
    public loginDialogRef: MatDialogRef<LoginComponent>,
    public regDialogRef: MatDialogRef<RegistrationComponent>,
    public formBuilder: FormBuilder,
  ) { }

  onNoClick(): void {
    this.loginDialogRef.close();
  }

  // registration dialog
  openRegDialog(): void {
    this.loginDialogRef.close();
    const dialogRef = this.dialog.open(RegistrationComponent, {

    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  ngOnInit() {
  }

}
