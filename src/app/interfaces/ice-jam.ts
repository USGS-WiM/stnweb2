export interface IceJam {
    id: number;
    observationdatetime: string;
    jamtypeid: number;
    siteid: number;
    observerid: number;
    description: string;
    comments: string;
    site: string;
    type: string; // Jam Type
    observer: string;
    iceconditions: any;
    riverconditions: any;
    weatherconditions: any;
    damages: any;
    files: any; // will need to be changed depending on how we deal with files
}
