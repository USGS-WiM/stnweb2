import { NetworkName } from '@interfaces/network-name';
import { NetworkType } from '@interfaces/network-type';
import { ObjectivePoint } from '@interfaces/objective-point';
import { Sensor } from '@interfaces/sensor';
import { Hwm } from '@interfaces/hwm';
export interface Site {
    site_id: number;
    site_no: string;
    site_name: string;
    site_description: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    other_sid: string;
    county: string;
    waterbody: string;
    latitude_dd: number;
    longitude_dd: number;
    hdatum_id: number;
    zone: string;
    is_permanent_housing_installed: string;
    usgs_sid: string;
    noaa_sid: string;
    hcollect_method_id: number;
    site_notes: string;
    safety_notes: string;
    access_granted: string;
    last_updated: string;
    last_updated_by: number
    network_name_site: NetworkName[],
    network_type_site: NetworkType[],
    objective_points: ObjectivePoint[],
    instruments: Sensor[],
    files: File[],
    site_housing: [],
    hwms: Hwm[]
}
