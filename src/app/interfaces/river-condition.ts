export interface RiverCondition {
    id: number;
    icejamid: number;
    datetime: string;
    riverconditionid: number;
    isflooding: boolean;
    stagetypeid: number;
    measurment: number;
    ischanging: boolean;
    comments: string;
    stagetype: any;
    type: any; // riverconditiontype
}
