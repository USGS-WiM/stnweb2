import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { State } from '@interfaces/state';
import { Event } from '@interfaces/event';
import { EventType } from '@app/interfaces/event-type';
import { NetworkName } from '@interfaces/network-name';
import { SensorType } from '@interfaces/sensor-type';
import { SensorTypeService } from '@app/services/sensor-type.service';
import { NetworkNameService } from '@app/services/network-name.service';

@Component({
    selector: 'app-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
    @Input('mapFilterForm') mapFilterForm: Object;
    @Input('states') states: State[] = [];
    @Input('filteredEvents$') filteredEvents$: Observable<Event[]>;
    @Input('filteredStates$') filteredStates$: Observable<State[]>;
    @Input('selectedStates') selectedStates: Observable<State[]>;
    @Input('eventStates$') eventStates$: Observable<State[]>;
    @Input('eventTypes$') eventTypes$: Observable<EventType[]>;
    @Output() updateEventFilter = new EventEmitter();
    @Output() submitMapFilter = new EventEmitter();
    @Output() clearMapFilterForm = new EventEmitter();
    @Output() selectState = new EventEmitter<any>();
    @Output() remove = new EventEmitter<any>();
    @Output() addState = new EventEmitter<any>();
    @Output() displayMostRecentEvent = new EventEmitter();
    @Output() getEventList = new EventEmitter();

    networks$: Observable<NetworkName[]>;
    sensorTypes$: Observable<SensorType[]>;

    public removable = true;

    eventPanelState: boolean = false;
    networksPanelState: boolean = false;
    sensorPanelState: boolean = false;
    statesPanelState: boolean = false;
    hmwPanelState: boolean = false;
    additionalFiltersPanelState: boolean = false;

    constructor(
        private networkNameService: NetworkNameService,
        private sensorTypeService: SensorTypeService,
    ) {
        this.networks$ = this.networkNameService.networks$;
        this.sensorTypes$ = this.sensorTypeService.sensorTypes$;
    }

    ngOnInit(): void {}

    // Update event list when filters are changed
    onEventChange(){
        this.updateEventFilter.emit();
    }

    // Call parent function when Submit is clicked
    onSubmit(){
        this.submitMapFilter.emit();

        // Close map filters when submitted
        this.eventPanelState = false;
        this.networksPanelState = false;
        this.sensorPanelState = false;
        this.statesPanelState = false;
        this.hmwPanelState = false;
        this.additionalFiltersPanelState = false;
    }

    // Call parent function when Clear Filters is clicked
    onClear(){
        this.clearMapFilterForm.emit();
    }

    // options to be displayed when selecting event filter
    displayEvent(event: Event): string {
        return event && event.event_name ? event.event_name : '';
    }

    //will return a comma separated list of selected states
    displayEventState(state: any): string {
        return state && state.state_name ? state.state_name : '';
    }

    // Autocomplete option selected
    stateSelected($event){
        this.selectState.emit($event);
    }

    // Remove selected state
    removeState($event){
        this.remove.emit($event);
    }

    // Add state to selection
    add($event){
        this.addState.emit($event);
    }

}
