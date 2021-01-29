import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorService } from '@services/sensor.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';

@Component({
    selector: 'app-result-details',
    templateUrl: './result-details.component.html',
    styleUrls: ['./result-details.component.scss'],
})
export class ResultDetailsComponent implements OnInit {
    sensorDataSource = new MatTableDataSource([]);
    siteSensors;

    displayedColumns: string[] = [
        'DeploymentType',
        'event_id',
        'housingType',
        'instrument_status',
        'location_description',
        'sensorType',
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sensorService: SensorService
    ) {}

    ngOnInit(): void {
        this.getSiteSensorData();
    }

    getSiteSensorData() {
        // Check if an event is selected and only display site sensors for that event
        if (this.data['mapFilterForm']['eventsControl'].value !== null) {
            const eventID = this.data['mapFilterForm']['eventsControl'].value
                .event_id;
            this.sensorService
                .getSiteEventInstruments(this.data['site_id'], eventID)
                .subscribe((results) => {
                    console.log('EVENT: ', results);
                    this.siteSensors = results;
                });
            this.sensorDataSource.data = this.siteSensors;
        } else {
            // If no event is selected then display all sensor for a site
            this.sensorService
                .getSiteFullInstruments(this.data['site_id'])
                .subscribe((results) => {
                    console.log('NO EVENT: ', results);
                    this.siteSensors = results;
                    setTimeout(() => {
                        this.sensorDataSource.data = this.siteSensors;
                    }, 1000);
                });

            console.log(this.sensorDataSource.data);
        }
    }

    /* refreshDataSource() {
        this.filtersService.selectedSites.subscribe(
            (currentSites) => (this.currentSites = currentSites)
        );
        this.dataSource.data = this.currentSites;

        // setting sort and paging
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    } */
}
