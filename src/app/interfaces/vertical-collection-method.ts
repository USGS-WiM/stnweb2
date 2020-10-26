import { Hwm } from '@interfaces/hwm';

export interface VerticalCollectionMethod {
    vcollect_method_id: number;
    vcollect_method: string;
    hwms: Hwm[];
}
