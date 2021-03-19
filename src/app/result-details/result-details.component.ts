import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SensorService } from '@services/sensor.service';
import { EventService } from '@services/event.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';
import { APP_UTILITIES } from '@app/app.utilities';

@Component({
    selector: 'app-result-details',
    templateUrl: './result-details.component.html',
    styleUrls: ['./result-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultDetailsComponent implements OnInit {
    sensorDataSource = new MatTableDataSource([]);
    siteSensors;
    allEvents = [];

    displayedColumns: string[] = [
        'Deployment Type',
        'Event',
        'Housing Type',
        'Status',
        'Location Description',
        'Sensor Type',
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sensorService: SensorService,
        private eventService: EventService,
        private changeDetectorRefs: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.getSiteSensorData();
        this.getEvents();
        this.changeDetectorRefs.detectChanges();
    }

    getEvents() {
        this.eventService.getAllEvents().subscribe((result) => {
            this.allEvents = result;
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

                this.createDataSource(this.siteSensors);
            });
    }

    /* istanbul ignore next */
    createDataSource(data) {
        // variable for eventID storage if an event is selected so that we are only displaying sensors for that event
        let eventID;

        if (this.data['mapFilterForm']['eventsControl'] !== undefined) {
            if (this.data['mapFilterForm']['eventsControl'].value !== null) {
                eventID = this.data['mapFilterForm']['eventsControl'].value;
            }
        }
        let sensors = this.createSensorTableObjects(data, eventID);
        // looping through each sensor and retrieving the event name using the event_id

        console.log(sensors);
        this.sensorDataSource.data = sensors;
        this.changeDetectorRefs.detectChanges();
    }

    /* istanbul ignore next */
    createSensorTableObjects(data, eventID) {
        let sensors = [];
        // setting storage for sensors and event name
        let eventName;
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
        return sensors;
    }
}
