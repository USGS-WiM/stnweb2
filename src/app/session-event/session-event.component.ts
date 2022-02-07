import { Component, OnInit } from '@angular/core';
import { EventService } from '@app/services/event.service';
import { FiltersService } from '@app/services/filters.service';

@Component({
  selector: 'app-session-event',
  templateUrl: './session-event.component.html',
  styleUrls: ['./session-event.component.scss']
})
export class SessionEventComponent implements OnInit {
  public eventID;
  public eventName;
  sessionevent: Array<Object> = [];

  constructor(
    private filtersService: FiltersService,
    private eventService: EventService,
  ) { 
    this.filtersService.getCurrentFilters().subscribe(result => {
      this.eventID = result.event_id;
    })
    if(this.eventID !== null){
      this.eventService.getEvent(this.eventID).subscribe(result => {
        this.eventName = result.event_name;
      })
    }else{
      this.eventName = "All Events";
    }
  }

  ngOnInit(): void {}

}
