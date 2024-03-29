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

        timePreview = localTime.setZone("UTC").toString();
        let hour = timePreview.split('T')[1].split(":")[0];
        let addDate = (timePreview.split('T')[0]) + "T" + String(hour).padStart(1, '0') + ":" + minute + ":00";
        timePreview = addDate;
        return timePreview;
    }
    if (timezone == "EST/EDT") {
        let localTime = DateTime.fromISO(date, {zone: 'America/New_York'});

        timePreview = localTime.setZone("UTC").toString();
        let hour = timePreview.split('T')[1].split(":")[0];
        let addDate = (timePreview.split('T')[0]) + "T" + String(hour).padStart(1, '0') + ":" + minute + ":00";
        timePreview = addDate;
        return timePreview;

    } if (timezone == "PST/PDT") {
        let localTime = DateTime.fromISO(date, {zone: 'America/Los_Angeles'});

        timePreview = localTime.setZone("UTC").toString();
        let hour = timePreview.split('T')[1].split(":")[0];
        let addDate = (timePreview.split('T')[0]) + "T" + String(hour).padStart(1, '0') + ":" + minute + ":00";
        timePreview = addDate;
        return timePreview;

    } if (timezone == "CST/CDT") {

        let localTime = DateTime.fromISO(date, {zone: 'America/Chicago'});

        timePreview = localTime.setZone("UTC").toString();
        let hour = timePreview.split('T')[1].split(":")[0];
        let addDate = (timePreview.split('T')[0]) + "T" + String(hour).padStart(1, '0') + ":" + minute + ":00";
        timePreview = addDate;
        return timePreview;

    } if (timezone == "MST/MDT") {

        let localTime = DateTime.fromISO(date, {zone: 'America/Denver'});

        timePreview = localTime.setZone("UTC").toString();
        let hour = timePreview.split('T')[1].split(":")[0];
        let addDate = (timePreview.split('T')[0]) + "T" + String(hour).padStart(1, '0') + ":" + minute + ":00";
        timePreview = addDate;
        return timePreview;

    }
  }

  public matchTimezone(time_zone) {
    if(time_zone === 'UTC'){
      return 'UTC';
    }else if (time_zone === 'EDT' || time_zone === 'EST'){
      return 'EST/EDT';
    }else if (time_zone === 'PDT' || time_zone === 'PST'){
      return 'PST/PDT';
    }else if (time_zone === 'CDT' || time_zone === 'CST'){
      return 'CST/CDT';
    }else if (time_zone === 'MDT' || time_zone === 'MST'){
      return 'MST/MDT';
    }

  }
}