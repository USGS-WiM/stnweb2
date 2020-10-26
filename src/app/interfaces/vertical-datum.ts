import { PeakSummary } from '@interfaces/peak-summary';
import { Hwm } from '@interfaces/hwm';

export interface VerticalDatum {
    datum_id: number;
    datum_name: string;
    datum_abbreviation: string;
    objective_point: [];
    instrument_status: [];
    peak_summary: PeakSummary[];
    hwms: Hwm[];
}
