export interface IceJam {
    id: number;
    observationdatetime: string;
    jamTypeId: number;
    siteID: number;
    observerID: number;
    description: string;
    comments: string;
    type: []; // Jam Type
    observer: string;
    damages: [];
    files: []; // will need to be changed depending on how we deal with files
}
