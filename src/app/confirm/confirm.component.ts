import { Component, OnInit, Inject } from '@angular/core';

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss'],
})
export class ConfirmComponent implements OnInit {
    // TODO: upgrade to latest mat dialog
    // constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
    constructor() {}

    ngOnInit() {}
}
