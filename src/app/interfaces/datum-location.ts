export interface DatumLocation {
    objective_point_id: number;
    name: string;
    description: string;
    elev_ft: number;
    date_established: string;
    op_is_destroyed: number;
    op_notes: string;
    site_id: number;
    vdatum_id: number;
    latitude_dd: number;
    longitude_dd: number;
    hdatum_id: number;
    hcollect_method_id: number;
    vcollect_method_id: number;
    op_type_id: number;
    date_recovered: string;
    uncertainty: number;
    unquantified: string;
    op_quality_id: number;
    last_updated: string;
    last_updated_by: number;
    op_measurements: Array<any>;
    op_control_identifier: Array<any>;
    files: Array<any>;
}
