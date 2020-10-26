import {Hwm} from '@interfaces/hwm';

export interface Event {
    event_id: number;
    event_name: string;
    event_start_date: string;
    event_end_date: string;
    event_description: string;
    event_type_id: number;
    event_status_id: number;
    event_coordinator: number;
    instruments: [];
    hwms: Hwm[];
}
