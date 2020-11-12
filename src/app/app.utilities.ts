import { Injectable } from '@angular/core';
import { Event } from '@interfaces/event'

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

}