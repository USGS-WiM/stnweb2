export interface Damage {
    id: number;
    iceJamId: number;
    damagetypeid: number;
    datetimereported: string;
    description: string;
    files: string; // will need to be changed depending on how we deal with files
    damagetype: string;
}
