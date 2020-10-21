import { Injectable } from '@angular/core';
import { APPSETTINGS } from '../app.settings';
import { StageType } from '../interfaces/stage-type';
import { Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StageTypeService {
    constructor(private _http: Http) {}

    public getStageTypes(): Observable<StageType[]> {
        return this._http
            .get(APPSETTINGS.STAGES_URL)
            .map((response: Response) => <StageType[]>response.json())
            .catch(this.handleError);
    }
    private handleError(error: Response) {
        console.error(error);
        return throwError(JSON.stringify(error.json()) || 'Server error');
    }
}
