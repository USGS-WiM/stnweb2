import { Component, OnInit } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { CurrentUserService } from './services/current-user.service';
import { AuthenticationService } from './services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { StatesService } from './services/states.service';
import { NetworkNamesService } from './services/network-names.service';
import { SensorTypesService } from './services/sensor-types.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'STN';
    siteid = '';

    // aboutDialogRef: MatDialogRef<AboutComponent>;
    // loginDialogRef: MatDialogRef<AboutComponent>;
    // regDialogRef: MatDialogRef<AboutComponent>;

    public currentUser;

    constructor(
        public dialog: MatDialog,
        private authenticationService: AuthenticationService,
        public currentUserService: CurrentUserService,
        public statesService: StatesService,
        public networkNamesService: NetworkNamesService,
        public sensorTypesService: SensorTypesService
    ) {
        currentUserService.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
    }

    openAboutDialog(): void {
        const dialogRef = this.dialog.open(AboutComponent, {});
        dialogRef.afterClosed().subscribe((result) => { });
    }

    openLoginDialog(): void {
        const dialogRef = this.dialog.open(LoginComponent, {});

        dialogRef.afterClosed().subscribe((result) => {
            console.log('The dialog was closed');
        });
    }

    ngOnInit() {
        if (sessionStorage.getItem('currentUser')) {
            const currentUserObj = JSON.parse(
                sessionStorage.getItem('currentUser')
            );
            this.currentUserService.updateCurrentUser(currentUserObj);
        } else {
            this.currentUserService.updateCurrentUser({
                first_name: '',
                last_name: '',
                username: '',
            });
        }
    }

    logout() {
        // remove user from local storage to log user out
        this.authenticationService.logout();
        console.log('logged out');
    }
}
