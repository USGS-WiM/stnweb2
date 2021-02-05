import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of, throwError } from 'rxjs';
import { Event } from '@interfaces/event';
import { Site } from '@interfaces/site';
import { NetworkName } from '@interfaces/network-name';
import { State } from '@interfaces/state';
import { Sitefullsensors } from '@interfaces/sitefullsensors';
import { SensorType } from '@interfaces/sensor-type';
import { Member } from '@interfaces/member';

@Injectable()
export class APP_UTILITIES {
    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    public static handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            // Consider creating a message service for this (https://angular.io/tutorial/toh-pt4)
            console.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            //return of(result as T);
            return throwError(error);
        };
    }
    /**
     * SORT utlity function
     * args: sortArray<array>(array to sort), sortField<string>(field on which to sort),
     * sortDirection<string>('ascend' or 'descend')
     **/
    public static SORT(sortArray, sortField, sortDirection): any {
        if (sortDirection === 'ascend') {
            return sortArray.sort((a, b) =>
                a[sortField] > b[sortField] ? 1 : -1
            );
        }
        if (sortDirection === 'descend') {
            return sortArray.sort((a, b) =>
                a[sortField] < b[sortField] ? 1 : -1
            );
        }
    }
    public static FILTER_EVENT(event_name: any, events: Event[]): Event[] {
        if (typeof event_name == 'string') {
            const filterValue = event_name.toLowerCase();
            return events.filter(
                (event) =>
                    event.event_name.toLowerCase().indexOf(filterValue) != -1
            );
        } else {
            const filterValue = event_name.event_name.toLowerCase();
            return events.filter(
                (event) =>
                    event.event_name.toLowerCase().indexOf(filterValue) != -1
            );
        }
    }
    public static FILTER_STATE(state_name: any, states: State[]): State[] {
        //state_name turns into the full state object when a state is selected
        //when you're typing, your text will be matched, when you select a state, the object will be matched
        if (typeof state_name == 'string') {
            const filterValue = state_name.toLowerCase();
            return states.filter(
                (state) =>
                    state.state_name.toLowerCase().indexOf(filterValue) != -1
            );
        } else {
            if (state_name[0] !== undefined) {
                const filterValue = state_name[0].state_name.toLowerCase();
                return states.filter(
                    (state) =>
                        state.state_name.toLowerCase().indexOf(filterValue) != 0
                );
            }
        }
    }
    public static ROUND(num, len): any {
        return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
    }
    public static SCALE_LOOKUP(mapZoom): any {
        switch (mapZoom) {
            case 19:
                return '1,128';
            case 18:
                return '2,256';
            case 17:
                return '4,513';
            case 16:
                return '9,027';
            case 15:
                return '18,055';
            case 14:
                return '36,111';
            case 13:
                return '72,223';
            case 12:
                return '144,447';
            case 11:
                return '288,895';
            case 10:
                return '577,790';
            case 9:
                return '1,155,581';
            case 8:
                return '2,311,162';
            case 7:
                return '4,622,324';
            case 6:
                return '9,244,649';
            case 5:
                return '18,489,298';
            case 4:
                return '36,978,596';
            case 3:
                return '73,957,193';
            case 2:
                return '147,914,387';
            case 1:
                return '295,828,775';
            case 0:
                return '591,657,550';
        }
    }

    public static FIND_OBJECT_BY_KEY(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return null;
    }

    public static get DUMMY_USER(): Member {
        return {
            member_id: 1,
            fname: 'Bob',
            lname: 'Jones',
            agency_id: 1,
            phone: '(123) 456-7890',
            email: 'stnadmin@usgs.gov',
            role_id: 1,
            username: 'user',
            password: 'password',
            salt: '',
            instrument_status: [],
            events: [],
            peak_summary: [],
            sites: [],
            approvals: [],
            data_file: [],
            hwms: [],
            hwms1: [],
        };
    }

    public static get EVENTS_DUMMY_DATA_LIST(): Event[] {
        return [
            {
                event_id: 7,
                event_name: 'FEMA 2013 exercise',
                event_start_date: '2013-05-15T04:00:00',
                event_end_date: '2013-05-23T04:00:00',
                event_description: 'Ardent/Sentry 2013 FEMA Exercise',
                event_type_id: 2,
                event_status_id: 2,
                event_coordinator: 36,
                instruments: [],
                hwms: [],
            },
            {
                event_id: 8,
                event_name: 'Wilma',
                event_start_date: '2005-10-20T00:00:00',
                event_end_date: '2005-10-31T00:00:00',
                event_description:
                    'Category 3 in west FL. \nHurricane Wilma was the most intense tropical cyclone ever recorded in the Atlantic basin. Part of the record breaking 2005 Atlantic hurricane season.',
                event_type_id: 2,
                event_status_id: 2,
                event_coordinator: 515,
                instruments: [],
                hwms: [],
            },
        ];
    }

    public static get DUMMY_EVENT(): Event {
        return {
            event_id: 24,
            event_name: 'Sandy',
            event_start_date: '2012-10-21T04:00:00',
            event_end_date: '2012-10-30T04:00:00',
            event_description:
                'historical hurricane data loaded by the data archive team',
            event_type_id: 2,
            event_status_id: 2,
            event_coordinator: 36,
            instruments: [],
            hwms: [],
        };
    }

    public static get DUMMY_SITE_FULL_SENSOR(): Sitefullsensors {
        return {
            sensorType: 'Pressure Transducer',
            deploymentType: 'Water Level',
            instCollection: 'Brackish Water',
            housingType: 'Ruston Steel Pipe',
            sensorBrand: 'Hobo',
            instrument_id: 8567,
            sensor_type_id: 1,
            deployment_type_id: 1,
            location_description:
                'HOBO mounted to southeast head wall of bridge. Same location used for previous deployment',
            serial_number: '9774314',
            interval: 30,
            site_id: 17783,
            event_id: 182,
            inst_collection_id: 2,
            housing_type_id: 0,
            sensor_brand_id: 5,
            vented: 'No',
            instrument_status: [],
            data_files: [],
            files: [],
        };
    }

    public static get SITES_DUMMY_DATA_LIST(): Site[] {
        return [
            {
                site_id: 3149,
                site_no: 'FLIND03149',
                site_name: 'SSS-FL-IND-001WL',
                site_description: 'Sebastian Inlet State Park,',
                address: 'A1A',
                city: 'Sebastian',
                state: 'FL',
                zip: '',
                other_sid: '',
                county: 'Indian River County',
                waterbody: 'Sebastian Inlet intracoastal',
                latitude_dd: 27.85508,
                longitude_dd: -80.45208,
                hdatum_id: 2,
                zone: '',
                is_permanent_housing_installed: '',
                usgs_sid: '',
                noaa_sid: '',
                hcollect_method_id: 1,
                member_id: null,
                site_notes:
                    'Sensor on second piling from land on east side of fishing pier in Sebastian Inlet State Park 0.5 miles west of entrance station south of bridge.',
                safety_notes: '',
                access_granted: '',
                last_updated: '2019-09-10T16:36:00.13484',
                last_updated_by: 3,
                network_name_site: [],
                network_type_site: [],
                objective_points: [],
                instruments: [],
                files: [],
                site_housing: [],
                hwms: [],
            },
            {
                site_id: 3151,
                site_no: 'FLBRE03151',
                site_name: 'SSS-FL-BRE-001WL',
                site_description: 'Lee Wenner Park',
                address: 'King St',
                city: 'Cocoa',
                state: 'FL',
                zip: '32956',
                other_sid: '',
                county: 'Brevard County',
                waterbody: 'Indian River',
                latitude_dd: 28.355,
                longitude_dd: -80.72217,
                hdatum_id: 4,
                zone: '',
                is_permanent_housing_installed: '',
                usgs_sid: '',
                noaa_sid: '',
                hcollect_method_id: 4,
                member_id: null,
                site_notes:
                    'off 520 - 520 E to Riveredge Blvd, turn right and go to Lee Wenner Park, turn left\n\nWooden pilings on T-dock left of boat launch (enter the park and bear left to boat ramp, T-dock is past the ramp',
                safety_notes: '',
                access_granted: '',
                last_updated: '2019-08-29T18:09:32.189622',
                last_updated_by: 105,
                network_name_site: [],
                network_type_site: [],
                objective_points: [],
                instruments: [],
                files: [],
                site_housing: [],
                hwms: [],
            },
        ];
    }

    public static get NETWORK_NAMES_DUMMY_DATA_LIST(): NetworkName[] {
        return [
            {
                network_name_id: 2,
                name: 'SWaTH',
                network_name_site: [],
            },
            {
                network_name_id: 3,
                name: 'SCoRE',
                network_name_site: [],
            },
        ];
    }

    public static get DUMMY_NETWORK_NAME(): NetworkName {
        return {
            network_name_id: 5,
            name: 'Coastal Change Hazards (CCH)',
            network_name_site: [],
        };
    }

    public static get STATES_DUMMY_DATA_LIST(): State[] {
        return [
            {
                state_id: 1,
                state_name: 'Alabama',
                state_abbrev: 'AL',
                counties: [],
            },
            {
                state_id: 7,
                state_name: 'Colorado',
                state_abbrev: 'CO',
                counties: [],
            },
        ];
    }

    public static get DUMMY_STATE(): State {
        return {
            state_id: 13,
            state_name: 'Georgia',
            state_abbrev: 'GA',
            counties: [],
        };
    }

    public static get SENSOR_TYPES_DUMMY_DATA_LIST(): SensorType[] {
        return [
            {
                deploymenttypes: [],
                sensor_type_id: 2,
                sensor: 'Wave Height',
                sensor_deployment: [],
                instruments: [],
            },
            {
                deploymenttypes: [],
                sensor_type_id: 8,
                sensor: 'Water Temperature',
                sensor_deployment: [],
                instruments: [],
            },
        ];
    }

    public static get DUMMY_SENSOR_TYPE(): SensorType {
        return {
            deploymenttypes: [],
            sensor_type_id: 4,
            sensor: 'Webcam',
            sensor_deployment: [],
            instruments: [],
        };
    }

    public static get FILTERED_SITES_SAMPLE_QUERY_PARAMS(): string {
        return `Event=&State=MS&SensorType=&NetworkName=&OPDefined=&HWMOnly=&HWMSurveyed=&SensorOnly=&RDGOnly=&HousingTypeOne=1`;
    }
}
