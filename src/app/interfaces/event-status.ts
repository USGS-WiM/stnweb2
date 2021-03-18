import { Event } from '@interfaces/event';

export interface EventStatus {
    event_status_id: number;
    status: string;
    events: Event[];
}
