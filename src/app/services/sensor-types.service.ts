import { APP_SETTINGS } from '../app.settings';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SensorTypesService {
    constructor(private http: HttpClient) {}

    private sensorTypesSubject: Subject<any>;

    public get sensorType(): Observable<any> {
        return this.sensorTypesSubject.asObservable();
    }

    public getNetworkNames(deployment_type_id: string) {
        const url = APP_SETTINGS.SensorTypes + '.json';
        const headers = APP_SETTINGS.AUTH_JSON_HEADERS;
        return this.http
            .get<any>(url, { headers })
            .subscribe(
                (res: any) => {
                    console.log('getting sensor type: ' + deployment_type_id);
                    this.sensorTypesSubject.next(res);
                },
                (err) => {
                    console.log(`http error getting {{deployment_type_id}}`);
                },
                () => {
                    console.log(
                        'successful for sensor type: ' + deployment_type_id
                    );
                }
            );
    }
}
