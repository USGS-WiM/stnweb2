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
            esriDynamicLayers: {
                HUC: esri.dynamicMapLayer({
                    url:
                        'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer',
                    opacity: 0.7,
                }),
            },
            esriFeatureLayers: {
                currentWarnings: esri.featureLayer({
                    url:
                        'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/0',
                    style: function () {
                        return { color: 'red', weight: 2 };
                    },
                    // minZoom: 9,
                }),
                watchesWarnings: esri.featureLayer({
                    url:
                        'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer/1',
                    style: function () {
                        return { color: 'orange', weight: 2 };
                    },
                    //  minZoom: 9,
                }),
                AHPSGages: esri.featureLayer({
                    url:
                        'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/ahps_riv_gauges/MapServer/0',
                    // minZoom: 9,
                    onEachFeature: function (feature, layer) {
                        if (feature.properties.status == 'major') {
                            layer.setIcon(
                                L.divIcon({ className: 'gageIcon majorFlood' })
                            );
                        } else if (feature.properties.status == 'moderate') {
                            layer.setIcon(
                                L.divIcon({
                                    className: 'gageIcon moderateFlood',
                                })
                            );
                        } else if (feature.properties.status == 'minor') {
                            layer.setIcon(
                                L.divIcon({ className: 'gageIcon minorFlood' })
                            );
                        } else if (feature.properties.status == 'action') {
                            layer.setIcon(
                                L.divIcon({ className: 'gageIcon nearFlood' })
                            );
                        } else if (feature.properties.status == 'no_flooding') {
                            layer.setIcon(
                                L.divIcon({ className: 'gageIcon noFlood' })
                            );
                        } else if (feature.properties.status == 'not_defined') {
                            layer.setIcon(
                                L.divIcon({ className: 'gageIcon floodND' })
                            );
                        } else if (
                            feature.properties.status == 'low_threshold'
                        ) {
                            layer.setIcon(
                                L.divIcon({
                                    className: 'gageIcon belowThreshold',
                                })
                            );
                        } else if (
                            feature.properties.status == 'obs_not_current'
                        ) {
                            layer.setIcon(
                                L.divIcon({
                                    className: 'gageIcon obsNotCurrent',
                                })
                            );
                        } else if (
                            feature.properties.status == 'out_of_service'
                        ) {
                            layer.setIcon(
                                L.divIcon({
                                    className: 'gageIcon outOfService',
                                })
                            );
                        }
                    },
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
}
