import { Hwm } from '@interfaces/hwm';

export interface HorizontalCollectMethod {
    hcollect_method_id: number;
    hcollect_method: string;
    hwms: Hwm[];
    sites: [];
}
