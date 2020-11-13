import { APP_SETTINGS } from '../app.settings';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StatesService {
    constructor(private http: HttpClient) {}

    private statesSubject: Subject<any>;

    public get eventSites(): Observable<any> {
        return this.statesSubject.asObservable();
    }

    public getStates(state_id: string) {
        const url = APP_SETTINGS.States + '.json';
        const headers = APP_SETTINGS.AUTH_JSON_HEADERS;
        return this.http
            .get<any>(url, { headers })
            .subscribe(
                (res: any) => {
                    console.log('getting state: ' + state_id);
                    this.statesSubject.next(res);
                },
                (err) => {
                    console.log(`http error getting {{state_id}}`);
                },
                () => {
                    console.log('successful for state: ' + state_id);
                }
            );
    }
}
