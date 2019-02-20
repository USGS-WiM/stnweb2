import { Component, OnInit, Input } from '@angular/core';
import { EventSubmissionComponent } from '../event-submission/event-submission.component';
import {NestedTreeControl} from '@angular/cdk/tree';
import {ArrayDataSource} from '@angular/cdk/collections';
import {SelectedSiteService} from '../services/selected-site.service';
import {CurrentUserService} from '../services/current-user.service';


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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  siteid: string;
  panelOpenState = false;
  errorMessage: string;
  map;
  icon;
  isloggedIn = APPSETTINGS.IS_LOGGEDIN;

  // events = [];
  sites = [];
  siteSelected;
  siteClicked = false;
  siteName;

  mapScale;
  latitude;
  longitude;
  zoomLevel;

  riverCondType;

  eventsLoading = false;
  public currentUser;
  markers;

  eventresults: IceJam[]; // sitevisits
  siteresults: Site[];
  eventtest: any;
  eventSites: any;
  // @Input() eventmod: EventSubmissionComponent;

  constructor(
    private siteService: SiteService,
    private eventService: IceJamService,
    private selectedSiteService: SelectedSiteService,
    public currentUserService: CurrentUserService
  ) {

    this.siteService.getAllSites()
      .subscribe(siteresults => {
        this.siteresults = siteresults;
        this.mapResults(this.siteresults);
      });

      selectedSiteService.currentID.subscribe(siteid => {
        this.siteid = siteid;
        });

      currentUserService.currentUser.subscribe(user => {
        this.currentUser = user;
      });

    /* this.eventService.getAllEvents()
      .subscribe(eventresults => {
          this.eventresults = eventresults;
          // Need to further refine at some point so that it's only pulling all sites for events during a winter season

          if (eventresults.length >= 0) {
            this.siteService.getAllSites()
            .subscribe(siteresults => {
                this.siteresults = siteresults;
                  // grabbing all the sites for each event
                  // after grabbing the sites we combine all fields into 1 array. This is used to populate the popup
                  const ret = [];
                  this.eventresults.forEach((itm, i) => {
                    ret.push(Object.assign({}, itm, this.siteresults[i]));
                    this.eventSites = ret;
                  });
                  console.log(this.eventSites);
                  // console.log(this.mergeEventSites(this.eventresults, this.siteresults));
                  this.mapResults(this.eventSites);
              });
          }
        },
        error => {
          this.errorMessage = <any>error;
          // this.openSnackBar('Query failed due to web service error. Please try again later.', 'OK', 8000);
        }
      ); */
  }

  ngOnInit() {
    // this.selectedSiteService.currentID.subscribe(siteid => this.siteid = siteid);
    console.log(this.isloggedIn);
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

  // another method to get event sites
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

  mapResults(siteresults: any) {
    console.log('we in it');
    // set/reset resultsMarker var to an empty array
    const markers = [];
    const iconClass = ' wmm-icon-diamond wmm-icon-white ';
    const riverConditions = [];

    // tslint:disable-next-line:forin
    // loop through results repsonse from a search query
    for (const sites in this.siteresults) {
      if (sites.length > 0) {
        const long = Number(this.siteresults[sites]['location']['coordinates']['0']);
        const lat = Number(this.siteresults[sites]['location']['coordinates']['1']);

        const myicon = L.divIcon({
          className: ' wmm-pin wmm-B2EBF2 wmm-icon-circle wmm-icon-white wmm-size-25'
        });

        let popupContent = '';

        popupContent = popupContent + '<h3>' + String(siteresults[sites]['name']) + '</h3>' +
          '<span class="popupLabel"><b>State</b>:</span> ' + String(siteresults[sites]['state']) + '<br/>' +
          '<span class="popupLabel"><b>County</b>:</span> ' + String(siteresults[sites]['county']) + '<br/>' +
          '<span class="popupLabel"><b>River</b>:</span> ' + String(siteresults[sites]['riverName']) + '<br/>' +
          '<span class="popupLabel"><b>USGSID</b>:</span> ' + String(siteresults[sites]['usgsid']);

        const popup = L.popup()
          .setContent(popupContent);

        L.marker([lat, long], { icon: myicon })
          .addTo(this.map)
          .bindPopup(popup)
          .on('click',
            (data) => {
              this.siteClicked = true;
              this.siteSelected = siteresults[sites]['id'];
              sessionStorage.setItem('selectedSite', JSON.stringify(this.siteSelected));
              console.log(this.siteSelected);
              this.siteName = siteresults[sites]['name'];
              /* this.selectedSiteService.currentID = siteresults[sites]['id'];
              console.log(this.selectedSiteService.currentID); */
              this.eventService.getAllEvents()
              .subscribe(eventresults => {
                this.eventresults = eventresults;
                console.log(eventresults);
                this.eventtest = eventresults.filter(event => event['siteID'] === this.siteSelected);
                console.log(this.eventtest);
                  // TODO write code for if there are no events
              });
              // this.eventsLoading = false;
            });
      }
    }
  }

}
