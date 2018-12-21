import { Component, OnInit } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';

import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ICEJAMS';

  aboutDialogRef: MatDialogRef<AboutComponent>;
  loginDialogRef: MatDialogRef<AboutComponent>;
  regDialogRef: MatDialogRef<AboutComponent>;

  constructor(public dialog: MatDialog, ) {}

  // about dialog
  openAboutDialog(): void {
    const dialogRef = this.dialog.open(AboutComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  // login dialog
  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {

    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnInit() { }
}
