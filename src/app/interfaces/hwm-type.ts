import { Hwm } from '@interfaces/hwm';

export interface HwmType {
    hwm_type_id: number;
    hwm_type: string;
    hwms: Hwm[];
}
