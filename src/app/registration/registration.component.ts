import { Component, OnInit } from '@angular/core';

import {
    FormBuilder,
    Validators,
    FormGroup,
    AbstractControl,
} from '@angular/forms';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
    hide = true;
    userRegistrationForm: FormGroup;

    matchEmail(AC: AbstractControl) {
        const email = AC.get('email').value; // to get value in input tag
        const confirmEmail = AC.get('confirmEmail').value; // to get value in input tag
        if (email !== confirmEmail) {
            AC.get('confirmEmail').setErrors({ matchEmail: true });
        } else {
            return null;
        }
    }

    matchPassword(AC: AbstractControl) {
        const password = AC.get('password').value; // to get value in input tag
        const confirmPassword = AC.get('confirmPassword').value; // to get value in input tag
        if (password !== confirmPassword) {
            AC.get('confirmPassword').setErrors({ matchPassword: true });
        } else {
            return null;
        }
    }

    getErrorMessage(formControlName) {
        return this.userRegistrationForm
            .get(formControlName)
            .hasError('required')
            ? 'Please enter a value'
            : this.userRegistrationForm.get(formControlName).hasError('email')
            ? 'Not a valid email'
            : this.userRegistrationForm
                  .get(formControlName)
                  .hasError('matchEmail')
            ? 'Emails do not match'
            : '';
    }

    buildUserRegistrationForm() {
        this.userRegistrationForm = this.formBuilder.group(
            {
                username: ['', Validators.required],
                first_name: '',
                last_name: '',
                email: ['', [Validators.required, Validators.email]],
                confirmEmail: ['', [Validators.required, Validators.email]],
                password: ['', Validators.required],
                confirmPassword: '',
                role: null,
            },
            {
                validator: [this.matchPassword, this.matchEmail],
            }
        );
    }

    constructor(
        // public regDialogRef: MatDialogRef<RegistrationComponent>,
        public formBuilder: FormBuilder
    ) {
        this.buildUserRegistrationForm();
    }

    ngOnInit() {}
}
