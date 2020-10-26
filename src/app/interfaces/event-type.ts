import { Event } from '@interfaces/Event';

export interface EventType {
    event_type_id: number;
    type: string;
    events: Event[];
}
