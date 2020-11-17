import { Injectable } from '@angular/core';
import { Event } from '@interfaces/event';
import { Site } from '@interfaces/site';

@Injectable()
export class APP_UTILITIES {

    public static get EVENTS_DUMMY_DATA_LIST(): Event[] {
        return [
            {
                event_id: 7,
                'event_name': 'FEMA 2013 exercise',
                'event_start_date': '2013-05-15T04:00:00',
                'event_end_date': '2013-05-23T04:00:00',
                'event_description': 'Ardent/Sentry 2013 FEMA Exercise',
                'event_type_id': 2,
                'event_status_id': 2,
                'event_coordinator': 36,
                'instruments': [],
                'hwms': []
            },
            {
                'event_id': 8,
                'event_name': 'Wilma',
                'event_start_date': '2005-10-20T00:00:00',
                'event_end_date': '2005-10-31T00:00:00',
                'event_description': 'Category 3 in west FL. \nHurricane Wilma was the most intense tropical cyclone ever recorded in the Atlantic basin. Part of the record breaking 2005 Atlantic hurricane season.',
                'event_type_id': 2,
                'event_status_id': 2,
                'event_coordinator': 515,
                'instruments': [],
                'hwms': []
            },

        ]
    }

    public static get DUMMY_EVENT(): Event {
        return { "event_id": 24, "event_name": "Sandy", "event_start_date": "2012-10-21T04:00:00", "event_end_date": "2012-10-30T04:00:00", "event_description": "historical hurricane data loaded by the data archive team", "event_type_id": 2, "event_status_id": 2, "event_coordinator": 36, "instruments": [], "hwms": [] }
    }

    public static get SITES_DUMMY_DATA_LIST(): Site[] {
        return [
            {
                "site_id": 3149,
                "site_no": "FLIND03149",
                "site_name": "SSS-FL-IND-001WL",
                "site_description": "Sebastian Inlet State Park,",
                "address": "A1A",
                "city": "Sebastian",
                "state": "FL",
                "zip": "",
                "other_sid": "",
                "county": "Indian River County",
                "waterbody": "Sebastian Inlet intracoastal",
                "latitude_dd": 27.85508,
                "longitude_dd": -80.45208,
                "hdatum_id": 2,
                "zone": "",
                "is_permanent_housing_installed": "",
                "usgs_sid": "",
                "noaa_sid": "",
                "hcollect_method_id": 1,
                "site_notes": "Sensor on second piling from land on east side of fishing pier in Sebastian Inlet State Park 0.5 miles west of entrance station south of bridge.",
                "safety_notes": "",
                "access_granted": "",
                "last_updated": "2019-09-10T16:36:00.13484",
                "last_updated_by": 3,
                "network_name_site": [],
                "network_type_site": [],
                "objective_points": [],
                "instruments": [],
                "files": [],
                "site_housing": [],
                "hwms": []
            },
            {
                "site_id": 3151,
                "site_no": "FLBRE03151",
                "site_name": "SSS-FL-BRE-001WL",
                "site_description": "Lee Wenner Park",
                "address": "King St",
                "city": "Cocoa",
                "state": "FL",
                "zip": "32956",
                "other_sid": "",
                "county": "Brevard County",
                "waterbody": "Indian River",
                "latitude_dd": 28.355,
                "longitude_dd": -80.72217,
                "hdatum_id": 4,
                "zone": "",
                "is_permanent_housing_installed": "",
                "usgs_sid": "",
                "noaa_sid": "",
                "hcollect_method_id": 4,
                "site_notes": "off 520 - 520 E to Riveredge Blvd, turn right and go to Lee Wenner Park, turn left\n\nWooden pilings on T-dock left of boat launch (enter the park and bear left to boat ramp, T-dock is past the ramp",
                "safety_notes": "",
                "access_granted": "",
                "last_updated": "2019-08-29T18:09:32.189622",
                "last_updated_by": 105,
                "network_name_site": [],
                "network_type_site": [],
                "objective_points": [],
                "instruments": [],
                "files": [],
                "site_housing": [],
                "hwms": []
            }
        ]
    }

}