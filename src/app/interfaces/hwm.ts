import { File } from '@interfaces/file';

export interface Hwm {
    hwm_id: number;
    waterbody: string;
    site_id: number;
    event_id: number;
    hwm_type_id: number;
    hwm_quality_id: number;
    hwm_locationdescription: string;
    latitude_dd: number;
    longitude_dd: number;
    survey_date: string;
    elev_ft: number;
    vdatum_id: number;
    vcollect_method_id: number;
    bank: string;
    approval_id: number;
    marker_id: number;
    hcollect_method_id: number;
    peak_summary_id: number;
    hwm_notes: string;
    hwm_environment: string;
    flag_date: string;
    stillwater: number;
    hdatum_id: number;
    flag_member_id: number;
    survey_member_id: number;
    hwm_label: string;
    last_updated: string;
    last_updated_by: number;
    files: File[];
}
