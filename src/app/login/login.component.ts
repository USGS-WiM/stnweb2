import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RegistrationComponent } from '../registration/registration.component';
// import { CurrentUserService } from '../services/current-user.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { CurrentUserService } from '../services/current-user.service';
// import { User } from '@interfaces/user';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    hide = true;
    loginForm: FormGroup;
    requestPending = false;
    submitted = false;
    returnUrl: string;
    error = '';
    public currentUser;

    constructor(
        public dialog: MatDialog,
        public loginDialogRef: MatDialogRef<LoginComponent>,
        public formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
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

        // reset login status
        // this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    /* istanbul ignore next */
    onSubmitLogin(formValue: any) {
        this.submitted = true;

        /* istanbul ignore next */
        this.requestPending = true;
        this.authenticationService
            .login(formValue.username, formValue.password)
            .pipe(first())
            .subscribe(
                (user: any) => {
                    //this.router.navigate([this.returnUrl]);
                    this.requestPending = false;
                    this.loginDialogRef.close();
                    this.openSnackBar('Successfully logged in!', 'OK', 5000);
                },
                (error) => {
                    this.error = error;
                    this.requestPending = false;
                    if (error.status === 403) {
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
