import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  hide = true;
  loginForm: FormGroup;

  constructor(
    public loginDialogRef: MatDialogRef<RegistrationComponent>,
    public formBuilder: FormBuilder,
    ) { }

    onNoClick(): void {
      this.loginDialogRef.close();
    }
  ngOnInit() {
  }

}
