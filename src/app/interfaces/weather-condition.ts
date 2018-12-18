export interface WeatherCondition {
    id: number;
    icejamid: number;
    datetime: string;
    weatherconditiontypeid: number;
    measurment: number;
    isestimated: boolean;
    ischanging: boolean;
    comments: string;
    type: any; // weatherconditiontype
}
