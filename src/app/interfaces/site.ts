import { Location } from './location';

export interface Site {
    id: number;
    name: string;
    location: Location; // uses Location interface to verify coords
    state: string;
    county: string;
    riverName?: string;
    huc?: string;
    usgsid?: string;
    ahpsid?: string;
    comments?: string[];
    landmarks?: string[];
}
