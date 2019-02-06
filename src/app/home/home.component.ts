import { Component, OnInit, Input } from '@angular/core';
import { EventSubmissionComponent } from '../event-submission/event-submission.component';


import * as L from 'leaflet';
// import { IceJam } from '@app/interfaces/ice-jam';
// import { IceJamService } from '../services/ice-jam.service';
import { Site } from '../interfaces/site';
import { IceJam } from '../interfaces/ice-jam';
import { SiteService } from '../services/site.service';
import { IceJamService } from '../services/ice-jam.service';
import { APPSETTINGS } from '../app.settings';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/forkJoin';
import { switchMap } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  errorMessage: string;
  map;
  icon;

  // events = [];
  sites = [];

  mapScale;
  latitude;
  longitude;
  zoomLevel;

  markers;

  eventresults: any;
  siteresults: any;
  eventSites: any;

  // @Input() eventmod: EventSubmissionComponent;

  constructor(
    private siteService: SiteService,
    private eventService: IceJamService,
  ) {

    /* const request1$ = Rx.Observable.of('response1').delay(2000);
    const request2$ = Rx.Observable.of('response2').delay(100);

    Rx.Observable.forkJoin(request1$, request2$)
      .subscribe(res => console.log(`forkJoin: ${res}`));

    request1$.switchMap(res1 => {
      console.log(`switchMap: ${res1}`);
      return request2$;
    }).subscribe(res2 => console.log(`switchMap: ${res2}`)); */

    this.eventService.getAllEvents()
      .subscribe(eventresults => {
          this.eventresults = eventresults;
          if (eventresults.length >= 0) {
            this.siteService.getAllSites()
            .subscribe(siteresults => {
                this.siteresults = siteresults;
                /* if (eventresults.length > 0) {
                  eventresults.filter(function(siteID) {
                    return siteresults.indexOf() - 1;
                  });
                } */
                setTimeout(() => {
                  const ret = [];
                  /*this.map = new L.Map('map', {
                    center: new L.LatLng(39.8283, -98.5795),
                    zoom: 4,
                  });*/
                  // this.locationMarkers.clearLayers();
                  // Getting the sites for events
                  // this.getEventSites(this.eventresults, this.siteresults);
                  this.eventresults.forEach((itm, i) => {
                    ret.push(Object.assign({}, itm, this.siteresults[i]));
                    this.eventSites = ret;
                  });
                  console.log(this.eventSites);
                  // console.log(this.mergeEventSites(this.eventresults, this.siteresults));
                  this.mapResults(this.eventSites);
                }, 100);
              });
          }
          // let siteIDs = [];
          // Number(results[events]['location']['coordinates']['0']);
        },
        error => {
          this.errorMessage = <any>error;
          // this.openSnackBar('Query failed due to web service error. Please try again later.', 'OK', 8000);
        }
      );
  }
  /* ngOnInit() {
    this.booksByStoreID = this.books.filter(
            book => book.store_id === this.store.id);
  } */
  ngOnInit() {

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.'
    });

    const grayscale = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    });

    const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    this.map = new L.Map('map', {
      center: new L.LatLng(39.8283, -98.5795),
      zoom: 4,
      layers: [osm]
    });
    /* this.markers = L.featureGroup().addTo(this.map); */

    const baseMaps = {
      'Open Street Map': osm,
      'Grayscale': grayscale,
      'Imagery': imagery
    };
    L.control.layers(baseMaps).addTo(this.map);
    L.control.scale({ position: 'bottomright' }).addTo(this.map);

    // begin latLngScale utility logic/////////////////////////////////////////////////////////////////////////////////////////
    // grabbed from FEV
    // displays map scale on map load
    // map.on( 'load', function() {
    this.map.whenReady(() => {
      const mapZoom = this.map.getZoom();
      const tempMapScale = this.scaleLookup(this.map.getZoom());
      this.zoomLevel = mapZoom;
      this.mapScale = tempMapScale;
      const initMapCenter = this.map.getCenter();
      this.latitude = initMapCenter.lat.toFixed(4);
      this.longitude = initMapCenter.lng.toFixed(4);
    });

    // displays map scale on scale change (i.e. zoom level)
    this.map.on('zoomend', () => {
      const mapZoom = this.map.getZoom();
      const mapScale = this.scaleLookup(mapZoom);
      this.mapScale = mapScale;
      this.zoomLevel = mapZoom;
    });

    // updates lat/lng indicator on mouse move. does not apply on devices w/out mouse. removes 'map center' label
    this.map.on('mousemove', (cursorPosition) => {
      // $('#mapCenterLabel').css('display', 'none');
      if (cursorPosition.latlng !== null) {
        this.latitude = cursorPosition.latlng.lat.toFixed(4);
        this.longitude = cursorPosition.latlng.lng.toFixed(4);
      }
    });
    // updates lat/lng indicator to map center after pan and shows 'map center' label.
    this.map.on('dragend', () => {
      // displays latitude and longitude of map center
      // $('#mapCenterLabel').css('display', 'inline');
      const geographicMapCenter = this.map.getCenter();
      this.latitude = geographicMapCenter.lat.toFixed(4);
      this.longitude = geographicMapCenter.lng.toFixed(4);
    });
    // end latLngScale utility logic/////////

  }
  scaleLookup(mapZoom) {
    switch (mapZoom) {
      case 19: return '1,128';
      case 18: return '2,256';
      case 17: return '4,513';
      case 16: return '9,027';
      case 15: return '18,055';
      case 14: return '36,111';
      case 13: return '72,223';
      case 12: return '144,447';
      case 11: return '288,895';
      case 10: return '577,790';
      case 9: return '1,155,581';
      case 8: return '2,311,162';
      case 7: return '4,622,324';
      case 6: return '9,244,649';
      case 5: return '18,489,298';
      case 4: return '36,978,596';
      case 3: return '73,957,193';
      case 2: return '147,914,387';
      case 1: return '295,828,775';
      case 0: return '591,657,550';
    }
  }

  /* getEventSites(arr, arr2) {
    const ret = [];
    for (const i in arr2) {
        if (arr2.indexOf(arr2[i]) > -1) {
            ret.push(arr2[i]);
        }
    }

    this.eventSites = ret;
    console.log(this.eventSites);
    return ret;
  } */

  mapResults(eventSites: any) {
    console.log('we in it');
    // set/reset resultsMarker var to an empty array
    const markers = [];
    const iconClass = ' wmm-icon-diamond wmm-icon-white ';

    // tslint:disable-next-line:forin
    // loop through results repsonse from a search query
    for (const events in this.eventSites) {
      if (events.length > 0) {
        const long = Number(eventSites[events]['location']['coordinates']['0']);
        const lat = Number(eventSites[events]['location']['coordinates']['1']);

        const myicon = L.divIcon({
          className: ' wmm-pin wmm-B2EBF2 wmm-icon-circle wmm-icon-white wmm-size-25'
        });

        let popupContent = '';

        popupContent = popupContent + '<h3>' + String(eventSites[events]['name']) + '</h3>' +
          '<span class="popupLabel">Date:</span> ' + String(eventSites[events]['observationDateTime']) + '<br/>' +
          '<span class="popupLabel">River:</span> ' + String(eventSites[events]['riverName']) + '<br/>' +
          '<span class="popupLabel">Description:</span> ' + String(eventSites[events]['description']) + '<br/>' +
          '<a href="./event/' + 'TODO' + '">TODO Link to Site Details </a>';

        const popup = L.popup()
          .setContent(popupContent);

        L.marker([lat, long], { icon: myicon })
          .addTo(this.map)
          .bindPopup(popup);
      }
    }
  }

}
