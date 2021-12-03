import { Component, OnInit } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { CurrentUserService } from '@services/current-user.service';
import { AuthenticationService } from '@services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { StateService } from '@services/state.service';
import { NetworkNameService } from '@services/network-name.service';
import { SensorTypeService } from '@services/sensor-type.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { APP_UTILITIES } from './app.utilities';
import { Member } from '@interfaces/member';
import { Router } from '@angular/router';
import 'uswds';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'STN';

    public currentUser;
    public loggedIn: boolean = false;
    role;

    constructor(
        public dialog: MatDialog,
        private authenticationService: AuthenticationService,
        public currentUserService: CurrentUserService,
        public StateService: StateService,
        public NetworkNameService: NetworkNameService,
        public SensorTypeService: SensorTypeService,
        private snackBar: MatSnackBar,
        private router: Router
    ) {
        currentUserService.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
        currentUserService.loggedIn.subscribe((status) => {
            this.loggedIn = status;
        });
    }

    openAboutDialog(): void {
        const dialogRef = this.dialog.open(AboutComponent, {});
        dialogRef.afterClosed().subscribe((result) => {});
    }

    openLoginDialog(): void {
        const dialogRef = this.dialog.open(LoginComponent, { disableClose: true });

        dialogRef.afterClosed().subscribe((result) => {
            //console.log('The dialog was closed');
        });
    }

    ngOnInit() {
        this.role = APP_UTILITIES.GET_ROLE();
        if (localStorage.getItem('currentUser')) {
            const currentUserObj = JSON.parse(
                localStorage.getItem('currentUser')
            );
            this.currentUserService.updateCurrentUser(currentUserObj);
            this.currentUserService.updateLoggedInStatus(true);
        } else {
            // this.currentUserService.updateCurrentUser({
            //     fname: '',
            //     lname: '',
            //     username: '',
            // });

            this.currentUserService.updateCurrentUser(null);
            this.currentUserService.updateLoggedInStatus(false);
            this.openLoginDialog();
        }
    }

    logout() {
        // remove user from local storage to log user out
        this.authenticationService.logout();
        this.openSnackBar('Successfully logged out.', 'OK', 5000);

        // redircting to landing page
        this.router.navigate(['/']);

        // opening the login dialog again
        this.openLoginDialog();
    }
    openSnackBar(message: string, action: string, duration: number) {
        this.snackBar.open(message, action, {
            duration: duration,
        });
    }
    //toggling between buttons in the nav toolbar changes the color of the selected button
    // I think this is causing the Angular test to fail until we add a second button, so commenting out for now
    /* toggleNavButtons() {
        let btnID = document.getElementById('navBarButtons');
        let navBtn = btnID.getElementsByClassName('navBarBtn');
        for (let i = 0; i < navBtn.length; i++) {
            navBtn[i].addEventListener('click', function () {
                var current = document.getElementsByClassName(
                    'navBarBtnActive'
                );
                current[0].className = current[0].className.replace(
                    ' navBarBtnActive',
                    ''
                );
                this.className += ' navBarBtnActive';
            });
        }
    } */
}
