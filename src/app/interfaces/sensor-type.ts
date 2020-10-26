import { DeploymentType } from '@interfaces/deployment-type';

export interface SensorType {
    deploymenttypes: DeploymentType[];
    sensor_type_id: number;
    sensor: string;
    sensor_deployment: [];
    instruments: [];
}
