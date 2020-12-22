import { Component, OnInit } from '@angular/core';
import {
    Router,
    ActivatedRoute,
    ParamMap,
    NavigationEnd,
} from '@angular/router';

@Component({
    selector: 'app-site-details',
    templateUrl: './site-details.component.html',
    styleUrls: ['./site-details.component.css'],
})
export class SiteDetailsComponent implements OnInit {
    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        // this.route.paramMap.subscribe((params) => {
        //     // request the site details here. the params var will contain the ID extracted from the URL.
        // });
    }
}
