import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

declare let L: any;
import 'leaflet';

@Injectable({
    providedIn: 'root',
})
export class FiltersService {
    constructor() {}

    private filteredSites = new BehaviorSubject<any>([]);
    selectedSites = this.filteredSites.asObservable();

    updateSites(sites: any) {
        this.filteredSites.next(sites);
    }
}
