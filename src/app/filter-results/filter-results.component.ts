import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-filter-results',
    templateUrl: './filter-results.component.html',
    styleUrls: ['./filter-results.component.css'],
})
export class FilterResultsComponent implements OnInit {
    @Input('eventSites') eventSites: Object;

    // dummy data
    displayedColumns: string[] = [
        'siteId',
        'siteName',
        'siteDesc',
        'state',
        'city',
        'latitude',
        'longitude',
        'waterbody',
        'permHouse',
    ];
    dataSource;

    constructor() {}

    ngOnInit(): void {
        setTimeout(() => {
            this.dataSource = this.eventSites;
        }, 5000);
    }
}
