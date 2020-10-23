export interface PeakSummary {
    peak_summary_id: number;
    member_id: number;
    peak_date: string;
    is_peak_estimated: number;
    is_peak_time_estimated: number;
    peak_stage: number;
    is_peak_stage_estimated: number;
    is_peak_discharge_estimated: number;
    vdatum_id: number;
    time_zone: string;
    calc_notes: string;
    data_file: Array<any>;
    hwms: Array<any>;
}
