import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
    constructor() {}
    // TODO: upgrade to latest mat dialog
    // constructor(public aboutDialogRef: MatDialogRef<AboutComponent>) {}

    // onNoClick(): void {
    //     this.aboutDialogRef.close();
    // }

    ngOnInit() {}
}
