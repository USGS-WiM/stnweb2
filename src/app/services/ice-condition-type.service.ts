import { Injectable } from '@angular/core';
import { APPSETTINGS } from '../app.settings';
import { IceConditionType } from '../interfaces/ice-condition-type';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class IceConditionTypeService {
    constructor(private _http: Http) {}

    public getIceTypes(): Observable<IceConditionType[]> {
        return this._http
            .get(APPSETTINGS.ICE_CONDITION_TYPES_URL)
            .map((response: Response) => <IceConditionType[]>response.json())
            .catch(this.handleError);
    }
    private handleError(error: Response) {
        console.error(error);
        return throwError(JSON.stringify(error.json()) || 'Server error');
    }
}
