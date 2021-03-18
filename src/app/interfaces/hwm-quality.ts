import { Hwm } from '@interfaces/hwm';

export interface HwmQuality {
    hwm_quality_id: number;
    hwm_quality: string;
    min_range: number;
    max_range: number;
    hwms: Hwm[];
}
