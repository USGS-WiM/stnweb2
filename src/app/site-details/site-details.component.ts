import { Component, OnInit } from '@angular/core';
import {
    Router,
    ActivatedRoute,
    ParamMap,
    NavigationEnd,
} from '@angular/router';
import { SiteService } from '@services/site.service';

@Component({
    selector: 'app-site-details',
    templateUrl: './site-details.component.html',
    styleUrls: ['./site-details.component.scss'],
})
export class SiteDetailsComponent implements OnInit {
    private siteID: string;
    private site;
    private siteHousing;

    displayedColumns: string[] = [
        'HousingType',
        'HousingLength',
        'HousingMaterial',
        'Amount',
        'Notes',
    ];

    constructor(
        private route: ActivatedRoute,
        public siteService: SiteService
    ) {}

    ngOnInit(): void {
        this.siteID = this.route.snapshot.params.id;
        console.log(this.siteID)

        this.siteService
            .getSingleSite(this.siteID)
            .subscribe((results) => {
                this.site = results;
                console.log(this.site)
            });

        // Get data for housing type table
        this.siteService
            .getSiteHousing(this.siteID)
            .subscribe((results) => {
                this.siteHousing = results;
                console.log(this.siteHousing)
            });
    }
}
