import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

declare let L: any;
import 'leaflet';

@Injectable({
    providedIn: 'root',
})
export class FiltersService {
    private resultsPanelState = new BehaviorSubject(true);
    public resultsPanelOpen = this.resultsPanelState.asObservable();
    constructor() {}

    private filteredSites = new BehaviorSubject<any>([]);
    selectedSites = this.filteredSites.asObservable();

    changeResultsPanelState(state: boolean) {
        this.resultsPanelState.next(state);
    }

    updateSites(sites: any) {
        this.filteredSites.next(sites);
    }
}
