import { Injectable } from '@angular/core';
declare let L: any;
import * as esri from 'esri-leaflet';

@Injectable()
export class MAP_CONSTANTS {
    public static get defaultCenter(): any {
        return new L.LatLng(39.8283, -98.5795);
    }
    public static get defaultZoom(): any {
        return 4;
    }
}
