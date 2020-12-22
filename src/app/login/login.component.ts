import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { first } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { CurrentUserService } from '../services/current-user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    hide = true;
    loginForm: FormGroup;
    requestPending = false;
    returnUrl: string;
    error = '';
    public currentUser;
    public returnedUser;

    constructor(
        public dialog: MatDialog,
        public loginDialogRef: MatDialogRef<LoginComponent>,
        public formBuilder: FormBuilder,
        public authenticationService: AuthenticationService,
        public currentUserService: CurrentUserService,
        private snackBar: MatSnackBar
    ) {
        currentUserService.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
    }

    /* istanbul ignore next */
    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    onSubmitLogin(formValue: any) {
        this.returnedUser = null;
        this.requestPending = true;
        this.authenticationService
            .login(formValue.username, formValue.password)
            .pipe(first())
            .subscribe(
                (user: any) => {
                    //this.router.navigate([this.returnUrl]);
                    this.returnedUser = user;
                    this.requestPending = false;
                    this.loginDialogRef.close();
                    this.openSnackBar('Successfully logged in!', 'OK', 5000);
                },
                (error) => {
                    this.error = error;
                    this.requestPending = false;
                    if (error.status === 403 || error.status === 401) {
                        this.openSnackBar(
                            'Invalid username and/or password. Please try again.',
                            'OK',
                            8000
                        );
                    } else {
                        this.openSnackBar(
                            'Error. Failed to login. Error message: ' + error,
                            'OK',
                            8000
                        );
                    }
                }
            );
    }

    onSubmitLogout() {
        this.authenticationService.logout();
        this.returnedUser = null;
        // if (this.router.url === '/home') {
        //   location.reload();
        // } else {
        //   this.router.navigate([`../home/`], { relativeTo: this.route });
        // }
    }

    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, {
            duration: duration,
        });
    }

    getErrorMessage(formControlName) {
        return this.loginForm.get(formControlName).hasError('required')
            ? 'Please enter a value'
            : this.loginForm.get(formControlName).hasError('email')
            ? 'Not a valid email'
            : '';
    }
}
