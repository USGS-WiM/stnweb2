import { Hwm } from '@interfaces/hwm';

export interface Marker {
    marker_id: number;
    marker1: string;
    hwms: Hwm[];
}
