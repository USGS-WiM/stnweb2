import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';
import { FiltersService } from '@services/filters.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ResultDetailsComponent } from '../result-details/result-details.component';

@Component({
    selector: 'app-filter-results',
    templateUrl: './filter-results.component.html',
    styleUrls: ['./filter-results.component.scss'],
})
export class FilterResultsComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    dataSource = new MatTableDataSource([]);
    sortedData = [];
    currentSites;
    resultsPanelOpen: boolean = true;
    subscription: Subscription;

    // columns for results table
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

    constructor(
        private filtersService: FiltersService,
        public dialog: MatDialog
    ) {
        this.filtersService.selectedSites.subscribe(
            (currentSites) => (this.currentSites = currentSites)
        );

        this.subscription = this.filtersService.resultsPanelOpen.subscribe(
            (state) => (this.resultsPanelOpen = state)
        );
    }

    ngOnInit(): void {}

    ngAfterViewInit() {}

    getDetails(row): void {
        const dialogRef = this.dialog.open(ResultDetailsComponent, {});
        console.log(row);
        dialogRef.afterClosed().subscribe((result) => {});
    }

    // called to refresh the datasource/table results
    refreshDataSource() {
        this.filtersService.selectedSites.subscribe(
            (currentSites) => (this.currentSites = currentSites)
        );
        this.dataSource.data = this.currentSites;

        // setting sort and paging
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    // fired when user clicks a sortable header
    sortData(sort: Sort) {
        const data = this.currentSites.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedData = data;
            return;
        }
        /* istanbul ignore next */
        this.sortedData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'siteId':
                    return this.compare(a.site_id, b.site_id, isAsc);
                case 'siteName':
                    return this.compare(a.site_name, b.site_name, isAsc);
                case 'state':
                    return this.compare(a.state, b.state, isAsc);
                case 'city':
                    return this.compare(a.city, b.city, isAsc);
                case 'waterbody':
                    return this.compare(a.waterbody, b.waterbody, isAsc);
                case 'permHouse':
                    return this.compare(
                        a.is_permanent_housing_installed,
                        b.is_permanent_housing_installed,
                        isAsc
                    );
                default:
                    return 0;
            }
        });
    }
    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
