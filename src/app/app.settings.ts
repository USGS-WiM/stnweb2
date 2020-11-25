import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class APP_SETTINGS {
    private static _environment = 'development';
    // default env is development
    public static get API_ROOT() {
        return environment.api_root;
    }

    /* istanbul ignore next */
    public static set environment(env: string) {
        this._environment = env;
    }
    public static get IS_LOGGEDIN(): boolean {
        return (
            !!localStorage.getItem('username') &&
            !!localStorage.getItem('password')
        );
    }

    public static get AUTH_URL(): string {
        return this.API_ROOT + 'login';
    }

    /* istanbul ignore next */
    public static get AGENCIES_URL(): string {
        return this.API_ROOT + 'agencies/';
    }
    /* istanbul ignore next */
    public static get DAMAGE_TYPES_URL(): string {
        return this.API_ROOT + 'damagetypes/';
    }
    /* istanbul ignore next */
    public static get EVENTS_URL(): string {
        return this.API_ROOT + 'sitevisits/';
    }
    /* istanbul ignore next */
    public static get FILE_TYPES_URL(): string {
        return this.API_ROOT + 'filetypes/';
    }
    /* istanbul ignore next */
    public static get ICE_CONDITION_TYPES_URL(): string {
        return this.API_ROOT + 'iceconditiontypes/';
    }
    /* istanbul ignore next */
    public static get JAM_TYPES_URL(): string {
        return this.API_ROOT + 'jamtypes/';
    }
    /* istanbul ignore next */
    public static get OBSERVERS_URL(): string {
        return this.API_ROOT + 'observers/';
    }
    /* istanbul ignore next */
    public static get STAGES_URL(): string {
        return this.API_ROOT + 'stagetypes/';
    }
    /* istanbul ignore next */
    public static get ROLES_URL(): string {
        return this.API_ROOT + 'roles/';
    }
    /* istanbul ignore next */
    public static get ROUGHNESS_TYPES_URL(): string {
        return this.API_ROOT + 'roughnesstypes/';
    }
    /* istanbul ignore next */
    public static get RIVER_CONDITION_TYPES(): string {
        return this.API_ROOT + 'riverconditiontypes/';
    }
    /* istanbul ignore next */
    public static get SITES_URL(): string {
        return this.API_ROOT + 'sites';
    }
    /* istanbul ignore next */
    public static get WEATHER_CONDITION_TYPES_URL(): string {
        return this.API_ROOT + 'weatherconditiontypes/';
    }

    // STN
    public static get EVENTS(): string {
        return this.API_ROOT + 'Events';
    }
    public static get NETWORK_NAMES(): string {
        return this.API_ROOT + 'NetworkNames';
    }
    public static get STATES(): string {
        return this.API_ROOT + 'States';
    }
    public static get SENSOR_TYPES(): string {
        return this.API_ROOT + 'SensorTypes';
    }

    public static get AUTH_JSON_HEADERS() {
        return new HttpHeaders({
            Authorization:
                'Basic ' +
                btoa(localStorage.username + ':' + localStorage.password),
            Accept: 'application/json',
        });
    }

    // default display query (display verison of search query above) for initial load of home page
    // public static get DEFAULT_DISPLAY_QUERY(): FilterQuery {
    //     return {
    //         events: [],
    //     };
    // }

    // default filter query (display verison of search query above) for initial load of home page
    public static get DEFAULT_FILTER_QUERY() {
        return {
            events: [],
        };
    }
}
