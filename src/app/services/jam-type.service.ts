import { Injectable } from '@angular/core';
import { APPSETTINGS } from '../app.settings';
import { JamType } from '../interfaces/jam-type';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class JamTypeService {
    constructor(private _http: Http) {}

    public getJamTypes(): Observable<JamType[]> {
        return this._http
            .get(APPSETTINGS.JAM_TYPES_URL)
            .map((response: Response) => <JamType[]>response.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        console.error(error);
        return throwError(JSON.stringify(error.json()) || 'Server error');
    }
}
