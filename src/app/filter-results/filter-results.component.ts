import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FiltersService } from '@services/filters.service';

@Component({
    selector: 'app-filter-results',
    templateUrl: './filter-results.component.html',
    styleUrls: ['./filter-results.component.css'],
})
export class FilterResultsComponent implements OnInit {
    @Input('sitesDataArray') sitesDataArray: Object;
    currentSites;
    sitedata;
    ELEMENT_DATA: [];
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

    constructor(private filtersService: FiltersService) {
        this.filtersService.selectedSites.subscribe(
            (currentSites) => (this.currentSites = currentSites)
        );
    }

    ngOnInit(): void {
        //
        setTimeout(() => {
            this.dataSource = new MatTableDataSource(this.currentSites);
        }, 500);
    }
}
