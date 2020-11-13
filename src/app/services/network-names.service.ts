import { APP_SETTINGS } from '../app.settings';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NetworkNamesService {
    constructor(private http: HttpClient) {}

    private networkNamesSubject: Subject<any>;

    public get networkName(): Observable<any> {
        return this.networkNamesSubject.asObservable();
    }

    public getNetworkNames(network_name_id: string) {
        const url = APP_SETTINGS.NetworkNames + '.json';
        const headers = APP_SETTINGS.AUTH_JSON_HEADERS;
        return this.http
            .get<any>(url, { headers })
            .subscribe(
                (res: any) => {
                    console.log('getting network name: ' + network_name_id);
                    this.networkNamesSubject.next(res);
                },
                (err) => {
                    console.log(`http error getting {{network_name_id}}`);
                },
                () => {
                    console.log(
                        'successful for network name: ' + network_name_id
                    );
                }
            );
    }
}
