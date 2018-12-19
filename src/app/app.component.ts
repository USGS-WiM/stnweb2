import { Component } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';

import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ICEJAMS';

  aboutDialogRef: MatDialogRef<AboutComponent>;

  constructor(public dialog: MatDialog, ) {}

  openAboutDialog(): void {
    const dialogRef = this.dialog.open(AboutComponent, {

    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {

    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnInit() { }
}
