import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorService } from '@services/sensor.service';
import { EventService } from '@services/event.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { APP_UTILITIES } from '@app/app.utilities';
import { Router } from '@angular/router';

@Component({
    selector: 'app-result-details',
    templateUrl: './result-details.component.html',
    styleUrls: ['./result-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultDetailsComponent implements OnInit {
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    sensorDataSource = new MatTableDataSource([]); 
    sortedData = [];
    siteSensors = [];
    allEvents = [];
    sensorData;
    isInit = true;

    displayedColumns: string[] = [
        'Event',
        'Location Description',
        'Deployment Type',
        'Housing Type',
        'Sensor Type',
        'Status',
    ];

    constructor(
        private dialogRef: MatDialogRef<ResultDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sensorService: SensorService,
        private eventService: EventService,
        private changeDetectorRefs: ChangeDetectorRef,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.getSiteSensorData();
        this.changeDetectorRefs.detectChanges();
    }

    getEvents() {
        this.eventService.getAllEvents().subscribe((result) => {
            this.allEvents = result;
            this.createDataSource(this.siteSensors);
            /* error => {
                this.errorMessage = <any>error;
              } */
        });
    }

    getSiteSensorData() {
        this.sensorService
            .getSiteFullInstruments(this.data['site_id'])
            .subscribe((results) => {
                this.siteSensors = results;
                this.getEvents();
            });
    }

    routeToSite() { 
        this.router.navigateByUrl('/Site/' + this.data['site_id'] + '/SiteDashboard');
    }

    /* istanbul ignore next */
    createDataSource(data) {
        // variable for eventID storage if an event is selected so that we are only displaying sensors for that event
        let eventID;

        if (this.data !== undefined && this.data['mapFilterForm'] !== undefined && this.data['mapFilterForm']['eventsControl'] !== undefined) {
            if (this.data['mapFilterForm']['eventsControl'].value !== null) {
                eventID = this.data['mapFilterForm']['eventsControl'].value;
            }
        }
        let sensors = this.createSensorTableObjects(data, eventID);
        // looping through each sensor and retrieving the event name using the event_id

        this.sensorDataSource.data = sensors;
        this.sensorDataSource.sort = this.sort;
        // Sort  by Deployed > Retrieved > Proposed > Lost initially
        this.sortData({active: "status", direction: "asc"});
        this.changeDetectorRefs.detectChanges();
    }

    /* istanbul ignore next */
    createSensorTableObjects(data, eventID) {
        let sensors = [];
        // setting storage for sensors and event name
        let eventName;
        if(data.length !== 0){
            this.dialogRef.updateSize("80%", "auto");
        }
        for (let i = 0; i < data.length; i++) {
            var obj = APP_UTILITIES.FIND_OBJECT_BY_KEY(
                this.allEvents,
                'event_id',
                data[i]['event_id']
            );

            // showing "None Listed" if housing type is empty string
            let hType =
                data[i]['housingType'] !== ''
                    ? data[i]['housingType']
                    : 'None listed';

            // showing "No status provided" if the sensor has no status
            let status =
                data[i]['instrument_status'].length !== 0
                    ? data[i]['instrument_status'][0]['status']
                    : 'No status provided';

            eventName = obj['event_name'];
            let sensorObject = {
                deploymentType: data[i]['deploymentType'],
                eventName: eventName,
                housingType: hType,
                instrument_status: status,
                location_description: data[i]['location_description'],
                sensorType: data[i]['sensorType'],
            };

            // If an event is selected be sure to only push sensors for that event into the array
            if (eventID !== undefined) {
                if (eventID['event_id'] === data[i]['event_id']) {
                    sensors.push(sensorObject);
                }
            } else if (eventID === undefined) {
                sensors.push(sensorObject);
            }
        }
        this.sensorData = sensors;
        return sensors;
    }

    // fired when user clicks a sortable header
    sortData(sort: Sort) {
        const data = this.sensorData.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedData = data;
            return;
        }
        /* istanbul ignore next */
        this.sortedData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'event':
                    return this.compare(a.eventName, b.eventName, isAsc);
                case 'location_description':
                    return this.compare(a.location_description, b.location_description, isAsc);
                case 'deployment_type':
                    return this.compare(a.deploymentType, b.deploymentType, isAsc);
                case 'housing_type':
                    return this.compare(a.housingType, b.housingType, isAsc);
                case 'sensor_type':
                    return this.compare(a.sensorType, b.sensorType, isAsc);
                case 'status':
                    if(this.isInit){
                        return this.initCompare(
                            a.instrument_status,
                            b.instrument_status,
                        );
                    }else{
                        return this.compare(
                            a.instrument_status,
                            b.instrument_status,
                            isAsc
                        ); 
                    }
                default:
                    return 0;
            }

        });
        // Set to false after initial sort
        this.isInit = false;
        
        // Need to update the data source to update the table rows
        this.sensorDataSource.data = this.sortedData;
    }
    initCompare(a: string, b: string) {
        if(a === "Deployed"){
            a = "1";
        }else if(a === "Retrieved"){
            a = "2";
        }else if(a === "Proposed"){
            a = "3";
        }else if(a === "Lost"){
            a = "4";
        }

        if(b === "Deployed"){
            b = "1";
        }else if(b === "Retrieved"){
            b = "2";
        }else if(b === "Proposed"){
            b = "3";
        }else if(b === "Lost"){
            b = "4";
        }

        return (Number(a) < Number(b) ? -1 : 1);
    }
    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
