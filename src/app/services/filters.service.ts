import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { SiteService } from '@services/site.service';

declare let L: any;
import 'leaflet';

@Injectable({
    providedIn: 'root',
})
export class FiltersService {
    constructor(public siteService: SiteService) {}

    private filteredSites = new BehaviorSubject<any>([]);
    selectedSites = this.filteredSites.asObservable();

    updateSites(sites: any) {
        this.filteredSites.next(sites);
    }
}
