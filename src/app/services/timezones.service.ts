import { Injectable } from '@angular/core';
import { DateTime } from "luxon";

@Injectable({
  providedIn: 'root'
})
export class TimezonesService {

  constructor() { }

  public convertTimezone(timezone, date, minute) {
    let timePreview;

    //check and see if they are not using UTC
    if (timezone == "UTC") {
        let localTime = DateTime.fromISO(date, {zone: 'Etc/GMT'});

        if(localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) + 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }
    }
    if (timezone == "EST") {
        let localTime = DateTime.fromISO(date, {zone: 'America/New_York'});

        if(localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) + 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    } if (timezone == "PST") {
        let localTime = DateTime.fromISO(date, {zone: 'America/Los_Angeles'});

        if(localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) + 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    } if (timezone == "CST") {

        let localTime = DateTime.fromISO(date, {zone: 'America/Chicago'});

        if(localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) + 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    } if (timezone == "MST") {

        let localTime = DateTime.fromISO(date, {zone: 'America/Denver'});

        if(localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) + 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    } if (timezone == "PDT") {

        let localTime = DateTime.fromISO(date, {zone: 'America/Los_Angeles'});

        if(!localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) - 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    } if (timezone == "EDT") {

        let localTime = DateTime.fromISO(date, {zone: 'America/New_York'});

        if(!localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) - 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    } if (timezone == "CDT") {

        let localTime = DateTime.fromISO(date, {zone: 'America/Chicago'});

        if(!localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) - 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    } if (timezone == "MDT") {

        let localTime = DateTime.fromISO(date, {zone: 'America/Denver'});

        if(!localTime.isInDST){
            timePreview = localTime.setZone("UTC").toString();
            let addHour = Number(timePreview.split('T')[1].split(":")[0]) - 1;
            let addDate = (timePreview.split('T')[0]) + "T" + String(addHour).padStart(1, '0') + ":" + minute + ":00";
            timePreview = addDate;
            return timePreview;
        }else{
            timePreview = localTime.setZone("UTC").toString();
            return timePreview;
        }

    }
  }
}
