import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
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

}
