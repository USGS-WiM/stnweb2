export interface IceCondition {
    id: number;
    icejamid: number;
    datetime: string;
    iceconditiontypeid: number;
    isestimated: boolean;
    ischanging: boolean;
    comments: string;
    upstreamendlocation: number;
    downstreamendlocation: number;
    roughnesstypeid: number;
    type: string;
    roughnesstype: string;
}
