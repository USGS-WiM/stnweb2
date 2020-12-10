import { Event } from '@interfaces/event';

export interface EventType {
    event_type_id: number;
    type?: string;
    events: Event[];
}
