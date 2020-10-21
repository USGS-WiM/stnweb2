import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable({
    providedIn: 'root',
})
export class SelectedSiteService {
    private selectedSiteId = new BehaviorSubject<string>('test');
    currentID = this.selectedSiteId.asObservable();

    constructor() {}
    changeSite(siteid: string) {
        this.selectedSiteId.next(siteid);
    }
}
