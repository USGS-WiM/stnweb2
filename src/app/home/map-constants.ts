import { Injectable } from '@angular/core';
declare let L: any;
import * as esri from 'esri-leaflet';

@Injectable()
export class MAP_CONSTANTS {
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
            esriDynamicLayers: {
                HUC: esri.dynamicMapLayer({
                    url:
                        'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer',
                    opacity: 0.7,
                }),
                currentWarnings: esri.dynamicMapLayer({
                    url:
                        'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/0',
                }),
                watchesWarnings: esri.dynamicMapLayer({
                    url:
                        'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/1',
                }),
                AHPSGages: esri.dynamicMapLayer({
                    url:
                        'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/ahps_riv_gauges/MapServer',
                }),
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

    public static get supplementaryLayers(): any {
        return {
            Watersheds: this.mapLayers.esriDynamicLayers.HUC,
            'Current Warnings': this.mapLayers.esriDynamicLayers
                .currentWarnings,
            'Watches/Warnings': this.mapLayers.esriDynamicLayers
                .watchesWarnings,
            'AHPS Gages': this.mapLayers.esriDynamicLayers.AHPSGages,
        };
    }

    // public static get drawnItems(): any {
    //     return L.featureGroup();
    // }

    // public static get drawControl(): any {
    //     return new L.Control.Draw({
    //         edit: {
    //             featureGroup: this.drawnItems,
    //             poly: {
    //                 allowIntersection: false,
    //             },
    //         },
    //         draw: {
    //             polygon: {
    //                 allowIntersection: false,
    //                 showArea: true,
    //                 metric: false,
    //             },
    //             marker: false,
    //             circle: false,
    //             circlemarker: false,
    //             rectangle: false,
    //             polyline: {
    //                 metric: false,
    //                 feet: false,
    //             },
    //         },
    //     });
    // }
}
