import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { CurrentUserService } from '../services/current-user.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';
    public currentUser;

    constructor(
        //public dialog: MatDialog,
        //public loginDialogRef: MatDialogRef<LoginComponent>,
        public formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
        public currentUserService: CurrentUserService
    ) {
        currentUserService.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
    }

    // registration dialog
    // openRegDialog(): void {
    //     this.loginDialogRef.close();

    //     dialogRef.afterClosed().subscribe((result) => {});
    // }
    /* istanbul ignore next */
    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });

        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    /* istanbul ignore next */
    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        /* istanbul ignore next */
        this.loading = true;
        // this.authenticationService
        //     .login(this.f.username.value, this.f.password.value)
        //     .pipe(first())
        //     .subscribe(
        //         (data) => {
        //             this.router.navigate([this.returnUrl]);
        //         },
        //         (error) => {
        //             this.error = error;
        //             this.loading = false;
        //         }
        //     );
    }
}
