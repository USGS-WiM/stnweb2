import { DataFile } from '@interfaces/data-file';
import { File } from '@interfaces/file';

export interface Sitefullsensors {
    sensorType: string;
    deploymentType: string;
    instCollection: string;
    housingType: string;
    sensorBrand: string;
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
    instrument_status: [];
    data_files: DataFile[];
    files: File[];
}
