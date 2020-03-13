import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Headers } from '@angular/http';
import { FilterQuery } from './interfaces/filter-query';

@Injectable()
export class APPSETTINGS {

    private static _environment = 'development';
    // default env is development
    public static get API_ROOT() {
        return environment.api_root;
    }

    public static set environment(env: string) { this._environment = env; }
    public static get IS_LOGGEDIN(): boolean { return (!!sessionStorage.getItem('username') && !!sessionStorage.getItem('password')); }
    public static get API_USERNAME(): string { return 'admin'; }
    public static get API_PASSWORD(): string { return 'icejamsadmin'; }

    public static get DEFAULT_COUNTRY(): string { return 'USA'; }

    public static get AUTH_URL(): string { return this.API_ROOT + 'login'; }

    public static get AGENCIES_URL(): string { return this.API_ROOT + 'agencies/'; }
    public static get DAMAGE_TYPES_URL(): string { return this.API_ROOT + 'damagetypes/'; }
    public static get EVENTS_URL(): string { return this.API_ROOT + 'sitevisits/'; } // i.e ice-jams
    public static get FILE_TYPES_URL(): string { return this.API_ROOT + 'filetypes/'; }
    public static get ICE_CONDITION_TYPES_URL(): string { return this.API_ROOT + 'iceconditiontypes/'; }
    public static get JAM_TYPES_URL(): string { return this.API_ROOT + 'jamtypes/'; }
    public static get OBSERVERS_URL(): string { return this.API_ROOT + 'observers/'; }
    public static get STAGES_URL(): string { return this.API_ROOT + 'stagetypes/'; }
    public static get ROLES_URL(): string { return this.API_ROOT + 'roles/'; }
    public static get ROUGHNESS_TYPES_URL(): string { return this.API_ROOT + 'roughnesstypes/'; }
    public static get RIVER_CONDITION_TYPES(): string { return this.API_ROOT + 'riverconditiontypes/'; }
    public static get SITES_URL(): string { return this.API_ROOT + 'sites'; }
    public static get WEATHER_CONDITION_TYPES_URL(): string { return this.API_ROOT + 'weatherconditiontypes/'; }

    // STN
    public static get EVENTS(): string { return this.API_ROOT + 'Events'; }

    public static get AUTH_JSON_HEADERS() {
        return new Headers({
            'Authorization': 'Basic ' + btoa(sessionStorage.username + ':' + sessionStorage.password),
            'Accept': 'application/json', 'Content-Type': 'application/json'
        });
    }

    // default display query (display verison of search query above) for initial load of home page
    public static get DEFAULT_DISPLAY_QUERY(): FilterQuery {
        return {
            'events': []
        };
    }

    // default filter query (display verison of search query above) for initial load of home page
    public static get DEFAULT_FILTER_QUERY() {
        return {
            'events': []
        };
    }
}
