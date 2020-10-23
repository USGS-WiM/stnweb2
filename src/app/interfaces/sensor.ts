export interface Sensor {
    instrument_id: number;
    sensor_type_id: number;
    deployment_type_id: number;
    location_description: string;
    serial_number: string;
    interval: number;
    site_id: number;
    event_id: number;
    inst_collection_id: number;
    housing_type_id: number;
    sensor_brand_id: number;
    vented: string;
    instrument_status: Array<any>;
    data_files: Array<any>;
    files: Array<any>;
}
