import { Event } from '@interfaces/Event';

export interface EventStatus {
    event_status_id: number;
    status: string;
    events: Event[];
}
