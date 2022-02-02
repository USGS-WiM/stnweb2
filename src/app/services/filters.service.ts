import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

declare let L: any;
import 'leaflet';
import { catchError, tap } from 'rxjs/operators';
import { APP_UTILITIES } from '@app/app.utilities';

@Injectable({
    providedIn: 'root',
})
export class FiltersService {
    private resultsPanelState = new BehaviorSubject(true);
    public resultsPanelOpen = this.resultsPanelState.asObservable();

    private filters = new BehaviorSubject<any>({event_id: null});
    currentFilters = this.filters.asObservable();

    constructor() {}

    private filteredSites = new BehaviorSubject<any>([]);
    selectedSites = this.filteredSites.asObservable();

    changeResultsPanelState(state: boolean) {
        this.resultsPanelState.next(state);
    }

    updateSites(sites: any) {
        this.filteredSites.next(sites);
    }

    public setCurrentFilters(currentFilters) {
        this.filters.next(currentFilters);
    }

    public getCurrentFilters(): Observable<any> {
        return this.currentFilters
            .pipe(
                tap((response) => {
                    return response;
                }),
                catchError(APP_UTILITIES.handleError<any>('getCurrentFilters', []))
            );
    }
}
