import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Headers } from '@angular/http';

@Injectable()
export class APPSETTINGS {

    private static _environment = 'development';
    // default env is development
    public static get API_ROOT() {
        return environment.api_root;
    }

    public static set environment(env: string) { this._environment = env; }
    public static get API_USERNAME(): string { return 'admin'; }
    public static get API_PASSWORD(): string { return 'icejamsadmin'; }

    public static get DEFAULT_COUNTRY(): string { return 'USA'; }

    // public static get AUTH_URL(): string { return this.API_ROOT + 'auth/'; }

    public static get AGENCIES_URL(): string { return this.API_ROOT + 'agencies/'; }
    public static get DAMAGE_TYPES_URL(): string { return this.API_ROOT + 'damagetypes/'; }
    public static get EVENTS_URL(): string { return this.API_ROOT + 'events/'; } // i.e ice-jams
    public static get FILE_TYPES_URL(): string { return this.API_ROOT + 'filetypes/'; }
    public static get ICE_CONDITION_TYPES_URL(): string { return this.API_ROOT + 'iceconditiontypes/'; }
    public static get JAM_TYPES_URL(): string { return this.API_ROOT + 'jamtypes/'; }
    public static get OBSERVERS_URL(): string { return this.API_ROOT + 'observers/'; }
    public static get ROLES_URL(): string { return this.API_ROOT + 'roles/'; }
    public static get ROUGHNESS_TYPES_URL(): string { return this.API_ROOT + 'roughnesstypes/'; }
    public static get SITES_URL(): string { return this.API_ROOT + 'sites/'; }
    public static get WEATHER_CONDITION_TYPES_URL(): string { return this.API_ROOT + 'weatherconditiontypes/'; }
}
