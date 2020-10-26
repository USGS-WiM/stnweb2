import { Hwm } from '@interfaces/hwm';

export interface HorizontalDatum {
    datum_id: number;
    datum_name: string;
    datum_abbreviation: string;
    hwms: Hwm[];
    sites: [];
}
