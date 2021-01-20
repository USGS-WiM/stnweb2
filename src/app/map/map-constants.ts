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
    public static get mapLayers(): any {
        return {
            tileLayers: {
                osm: L.tileLayer(
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    {
                        attribution:
                            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.',
                    }
                ),
                grayscale: L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution:
                            'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    }
                ),
                imagery: L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution:
                            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                    }
                ),
            },
        };
    }
    public static get baseMaps(): any {
        return {
            'Open Street Map': this.mapLayers.tileLayers.osm,
            Grayscale: this.mapLayers.tileLayers.grayscale,
            Imagery: this.mapLayers.tileLayers.imagery,
        };
    }
}
