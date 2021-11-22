import { Component, OnInit } from '@angular/core';
import {
    Router,
    ActivatedRoute,
    ParamMap,
    NavigationEnd,
} from '@angular/router';
import { SiteService } from '@services/site.service';
import { CurrentUserService } from '@services/current-user.service';
import { ReferenceMarkDialogComponent } from '@app/reference-mark-dialog/reference-mark-dialog.component';
import { SensorDialogComponent } from '@app/sensor-dialog/sensor-dialog.component';
import { HwmDialogComponent } from '@app/hwm-dialog/hwm-dialog.component';
import { FileDetailsDialogComponent } from '@app/file-details-dialog/file-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
declare let L: any;
import 'leaflet';
import { DateTime } from "luxon";
import { marker } from 'leaflet';
import { SiteEditComponent } from '@app/site-edit/site-edit.component';
import { ResultDetailsComponent } from '@app/result-details/result-details.component';

@Component({
    selector: 'app-site-details',
    templateUrl: './site-details.component.html',
    styleUrls: ['./site-details.component.scss'],
})
export class SiteDetailsComponent implements OnInit {
    public siteID: string;
    public site;
    public siteHousing;
    public noSiteInfo;
    public hdatum;
    public hmethod;
    public hdatumList = [];
    public hmethodList = [];
    public housingType;
    public networkType;
    public networkName;
    public landownerContact;
    public memberName;
    public event;
    public currentEvent;
    public referenceMarks = [];
    public siteFullInstruments = [];
    public hwm = [];
    public siteFiles = [];
    public datumLocFiles = [];
    public sensorFiles = [];
    public hwmFiles = [];
    public peaks = [];
    public files = [];
    public fileLength = 0;
    public sensorFilesDone = false;
    public siteMapHidden = true;
    public map;
    public baroSensorVisible = false;
    public rdgSensorVisible = false;
    public airTempSensorVisible = false;
    public waterTempSensorVisible = false;
    public thermSensorVisible = false;
    public waveSensorVisible = false;
    public stormSensorVisible = false;
    public humiditySensorVisible = false;
    public windSensorVisible = false;
    public otherSensorVisible = false;
    public nearbySitesVisible = false;
    public nearbyToggled = false;
    public priority;
    public nearbySites = L.featureGroup([]);
    public markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false
    });
    public currentUser;

    displayedColumns: string[] = [
        'HousingType',
        'HousingLength',
        'HousingMaterial',
        'Amount',
        'Notes',
    ];

    displayedSensorColumns: string[] = [
        'SerialNumber',
        'SensorEvent',
        'DeploymentType',
        'SensorStatus',
    ];

    displayedHWMColumns: string[] = [
        'HwmID',
        'HwmLabel',
        'HwmFlagDate',
        'HwmElev',
    ];

    displayedPeakColumns: string[] = [
        'PeakStage',
        'PeakEventName',
        'PeakDate',
    ];

    displayedSiteFileColumns: string[] = [
        'FileDate',
        'FileName',
    ];

    displayedDatumFileColumns: string[] = [
        'FileDate',
        'FileName',
        'FileDatum',
    ];

    displayedSensorFileColumns: string[] = [
        'FileDate',
        'FileName',
        'FileSerialNum',
    ];

    displayedHWMFileColumns: string[] = [
        'FileDate',
        'FileName',
    ];

    displayedRMColumns: string[] = [
        'RefMarkName',
        'RefMarkEl',
    ];

    constructor(
        private route: ActivatedRoute,
        public siteService: SiteService,
        public currentUserService: CurrentUserService,
        public dialog: MatDialog,
    ) {
        currentUserService.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe(routeParams => {
            this.siteID = routeParams.id
        })

        this.getData();

    }

    getData() {
        let self = this;

        this.siteService.getCurrentEvent().subscribe(result => this.currentEvent = result)
        // Get event name
        this.siteService
            .getSiteEvents(this.siteID)
            .subscribe((results) => {
                if(self.currentEvent === 0){
                    this.event = "All Events";
                }else{
                    if(results.length > 0){
                        results.forEach(function(result){
                            if (self.currentEvent == result.event_id){
                                self.event = result.event_name;
                            }
                        })
                    }
                }

            });

        this.siteService
            .getSingleSite(this.siteID)
            .subscribe((results) => {
                if(results.length === undefined || results.length > 0){
                    this.site = results;
                    this.noSiteInfo = false;

                    // Get horizontal datum lookup
                    this.siteService
                        .getHDatum()
                        .subscribe((results) => {
                            this.hdatumList = results;
                            results.forEach(function(result){
                                if (result.datum_id === self.site.hdatum_id){
                                    self.hdatum = result.datum_name;
                                }
                            });
                        });

                    // Get collection method lookup
                    this.siteService
                        .getHCollectionMethod()
                        .subscribe((results) => {
                            this.hmethodList = results;
                            results.forEach(function(result){
                                if (result.hcollect_method_id === self.site.hcollect_method_id){
                                    self.hmethod = result.hcollect_method;
                                }
                            });

                        });

                    // Get network type
                    this.siteService
                        .getNetworkType(this.siteID)
                        .subscribe((results) => {
                            let networkTypeArray = [];
                            if(results.length > 0){
                                results.forEach(function(result){
                                    networkTypeArray.push(result.network_type_name)
                                })
                                this.networkType = networkTypeArray.join(", ");
                            }

                        });

                    // Get network name
                    this.siteService
                        .getNetworkName(this.siteID)
                        .subscribe((results) => {
                            let networkNameArray = [];
                            if(results.length > 0){
                                results.forEach(function(result){
                                    networkNameArray.push(result.name)
                                })
                                this.networkName = networkNameArray.join(", ");
                            }

                        });

                    // Get datum locations
                    this.siteService
                    .getObjectivePoints(this.siteID)
                    .subscribe((results) => {
                        if(results.length > 0){
                            results.forEach(function(result){
                                self.referenceMarks.push(result);
                            })
                        }

                    });

                    // Get deployment priority
                    this.siteService
                    .getDepPriority(this.siteID)
                    .subscribe((results) => {
                        this.priority = results;
                    });

                    // If no event selected
                    if(this.currentEvent === 0){
                        // Get site full instruments
                        this.siteService
                        .getSiteFullInstruments(this.siteID)
                        .subscribe((results) => {
                                let self = this;
                                this.siteFullInstruments = results;

                                if(results.length > 0){
                                    this.siteFullInstruments.forEach(function(result){
                                        let timestamp = new Date(Math.max(...result.instrument_status.map(e => new Date(e.time_stamp))));
                                        
                                        result.instrument_status.forEach(function(statusType){
                                            let time = new Date(statusType.time_stamp);

                                            if (timestamp.getTime() === time.getTime()){
                                                result.statusType = statusType.status;
                                                self.siteFullInstruments = self.siteFullInstruments.filter(({ statusType }) => statusType !== 'Proposed');
                                            }
                                        })
                                        
                                        // Get event name for sensor using sensor_id
                                        self.siteService
                                        .getSensorEvents(result.instrument_id)
                                        .subscribe((eventResults) => {
                                            result.eventName = eventResults.event_name;
                                        })
                                    })
                                }

                        });

                        // Get HWM
                        this.siteService
                        .getHWM(this.siteID)
                        .subscribe((results) => {
                            if(results.length > 0){
                                this.hwm = results;
                                this.hwm.forEach(function(hwm){
                                    let flagDate = hwm.flag_date.split("T")[0];
                                    flagDate = flagDate.split("-");
                                    flagDate = flagDate[1] + "/" + flagDate[2] + "/" + flagDate[0];
                                    hwm.flag_date = flagDate;

                                    // Get event name for sensor using sensor_id
                                    self.siteService
                                    .getHWMEvents(hwm.hwm_id)
                                    .subscribe((eventResults) => {
                                        hwm.eventName = eventResults.event_name;
                                    })
                                })
                            }

                        });

                        //  Get files
                        this.siteService.getSiteFiles(this.siteID).subscribe((results) => {
                            this.files = results;
                            this.fileLength = this.files.length;
                            this.files.forEach(function(file){
                                let fileDate = file.file_date.split("T")[0];
                                fileDate = fileDate.split("-");
                                fileDate = fileDate[1] + "/" + fileDate[2] + "/" + fileDate[0];
                                file.file_date = fileDate;
                                if(file.instrument_id !== undefined){
                                    self.siteService.getFileSensor(file.file_id).subscribe((results) => {
                                        file.details = results;
                                        self.sensorFiles.push(file);
                                        // Wait for all files to finish being retrieved before loading table
                                        if (self.files.length === (self.sensorFiles.length + self.hwmFiles.length + self.siteFiles.length + self.datumLocFiles.length)){
                                            self.sensorFilesDone = true;
                                        }
                                    });
                                }else if (file.hwm_id !== undefined){
                                    self.hwmFiles.push(file);
                                }else if (file.objective_point_id !== undefined){
                                    self.datumLocFiles.push(file);
                                }else{
                                    self.siteFiles.push(file);
                                }
                            });
                        });

                    }else{
                        // If event selected
                        this.siteService
                        .getSiteEventInstruments(this.siteID, this.currentEvent)
                        .subscribe((results) => {
                            this.siteFullInstruments = results;
                            if(results.length > 0){
                                this.siteService
                                // Deployment type lookup
                                .getDeploymentTypes()
                                .subscribe((deploymentResults) => {
                                    this.siteFullInstruments.forEach(function(result){
                                        deploymentResults.forEach(function(type){
                                            if (result.deployment_type_id === type.deployment_type_id){
                                                result.deploymentType = type.method;
                                            }
                                        });

                                        // Get event name for sensor using sensor_id
                                        self.siteService
                                        .getSensorEvents(result.instrument_id)
                                        .subscribe((eventResults) => {
                                            result.eventName = eventResults.event_name;
                                        })
                                    });
                                })
                                // Status type lookup
                                this.siteService
                                .getStatusTypes()
                                .subscribe((statusResults) => {
                                    this.siteFullInstruments.forEach(function(result){
                                        self.siteService
                                        // Get each sensor status id and match to status type in lookup
                                        .getStatus(result.instrument_id)
                                        .subscribe((statusID) => {
                                            result.statusID = statusID.status_type_id;
                                            statusResults.forEach(function(status){
                                                if (result.statusID === status.status_type_id){
                                                    result.statusType = status.status;
                                                    self.siteFullInstruments = self.siteFullInstruments.filter(({ statusType }) => statusType !== 'Proposed');
                                                }
                                            });
                                        })
                                    });
                                })
                            }

                        });

                        // Get Event HWM
                        this.siteService
                        .getEventHWM(this.siteID, this.currentEvent)
                        .subscribe((results) => {
                            if(results.length > 0){
                                this.hwm = results;
                                this.hwm.forEach(function(hwm){
                                    let flagDate = hwm.flag_date.split("T")[0];
                                    flagDate = flagDate.split("-");
                                    flagDate = flagDate[1] + "/" + flagDate[2] + "/" + flagDate[0];
                                    hwm.flag_date = flagDate;
                                })
                            }

                        });

                        //  Get Event files for sensor and hwm
                        this.siteService.getSiteEventFiles(this.siteID, this.currentEvent).subscribe((results) => {
                            this.files = results;
                            this.files.forEach(function(file){
                                let fileDate = file.file_date.split("T")[0];
                                fileDate = fileDate.split("-");
                                fileDate = fileDate[1] + "/" + fileDate[2] + "/" + fileDate[0];
                                file.file_date = fileDate;
                                if(file.instrument_id !== undefined){
                                    self.siteService.getFileSensor(file.file_id).subscribe((results) => {
                                        file.details = results;
                                        self.sensorFiles.push(file);
                                        self.fileLength ++;
                                        // Wait for all files to finish being retrieved before loading table
                                        if (self.files.length === (self.sensorFiles.length + self.hwmFiles.length + self.siteFiles.length + self.datumLocFiles.length)){
                                            self.sensorFilesDone = true;
                                        }
                                    });
                                }else if (file.hwm_id !== undefined){
                                    self.hwmFiles.push(file);
                                    self.fileLength ++;
                                }
                            });
                        });

                        // Get site and datum location files not associated with an event
                        this.siteService.getSiteFiles(this.siteID).subscribe((results) => {
                            this.files = results;
                            this.files.forEach(function(file){
                                let fileDate = file.file_date.split("T")[0];
                                fileDate = fileDate.split("-");
                                fileDate = fileDate[1] + "/" + fileDate[2] + "/" + fileDate[0];
                                file.file_date = fileDate;
                                if (file.objective_point_id !== undefined){
                                    self.datumLocFiles.push(file);
                                    self.fileLength ++;
                                }else if (file.hwm_id === undefined && file.instrument_id === undefined){
                                    self.siteFiles.push(file);
                                    self.fileLength ++;
                                }
                            });
                        });

                    }

                    // Get Peaks
                    this.siteService
                    .getPeakSummaryView(this.siteID)
                    .subscribe((results) => {
                        if(results.length > 0){
                            results.forEach(function(result){
                                if (self.currentEvent === 0 || result.event_name === self.event){
                                    let peakDate = result.peak_date.split("T")[0];
                                    peakDate = peakDate.split("-");
                                    peakDate = peakDate[1] + "/" + peakDate[2] + "/" + peakDate[0];
                                    result.peak_date = peakDate;
                                    self.peaks.push(result);
                                }
                            }) 
                        }

                    });

                    // Get landowner contact
                    if (this.site.landownercontact_id !== undefined){
                        this.siteService
                            .getLandownerContact(this.siteID)
                            .subscribe((results) => {
                                this.landownerContact = results;
                            });
                    }

                    // Get member name
                    if(this.site.member_id !== undefined && this.site.member_id !== 0){
                        this.siteService
                            .getMemberName(this.site.member_id)
                            .subscribe((results) => {
                                this.memberName = results.fname + " " + results.lname;
                                
                            });
                    }else{
                        this.memberName = "---"
                    }
                    
                }else{
                    this.noSiteInfo = true;
                }
            });

        // Get data for housing type table
        this.siteService
            .getSiteHousing(this.siteID)
            .subscribe((results) => {
                this.siteHousing = results;
                // Get collection method lookup
                if(this.siteHousing.length > 0){
                    this.siteHousing.forEach(function(housing){
                        if (housing.housing_type_id !== undefined){
                            self.siteService
                                .getHousingType(housing.housing_type_id)
                                .subscribe((result) => {
                                    housing.housingType = result.type_name;
                                });
                        }
                    })
                }else{
                    this.siteHousing.forEach(function(housing){
                        housing.housingType = "Not Specified";
                    })
                }
            });
    }

    toggleSiteMap(){
        this.siteMapHidden = !this.siteMapHidden;
        if(!this.siteMapHidden && !this.map){
            document.getElementById('mapContainer').style.display = "block";
            this.createSiteMap();
        }else if(!this.siteMapHidden && this.map){
            document.getElementById('mapContainer').style.display = "block";
        }else{
            document.getElementById('mapContainer').style.display = "none";
        }
    }

    createSiteMap(){
        let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors.',
        });
        // instantiate leaflet map, with initial center, zoom level, and basemap
        this.map = new L.Map('mapContainer', {
            center: [this.site.latitude_dd, this.site.longitude_dd],
            zoom: 14,
            layers: [osm],
            renderer: L.canvas(),
        });

        if(document.querySelector('#legend') !== null){
            // Disable map scrolling when scrolling the legend
            L.DomEvent.disableScrollPropagation(document.querySelector('#legend'));
            // Enable clicking on map controls on mobile screens
            L.DomEvent.disableClickPropagation(document.querySelector('#legend'));
        }

        let hwmIcon = L.divIcon({className: "wmm-diamond wmm-altred wmm-icon-noicon wmm-icon-red wmm-size-15"});

        let siteIcon = L.divIcon({className: "wmm-pin wmm-altblue wmm-icon-circle wmm-icon-white wmm-size-20"});

        let baroIcon = L.divIcon({className: "wmm-square wmm-yellow wmm-icon-noicon wmm-icon-yellow wmm-size-15"});
        
        let waterTempIcon = L.divIcon({className: "wmm-square wmm-orange wmm-icon-noicon wmm-icon-orange wmm-size-15"});
        
        let rdgIcon = L.divIcon({className: "wmm-square wmm-green wmm-icon-noicon wmm-icon-green wmm-size-15"});
        
        let stormIcon = L.divIcon({className: "wmm-square wmm-purple wmm-icon-noicon wmm-icon-purple wmm-size-15"});
        
        let waveIcon = L.divIcon({className: "wmm-square wmm-blue wmm-icon-noicon wmm-icon-blue wmm-size-15"});
        
        let airTempIcon = L.divIcon({className: "wmm-circle wmm-yellow wmm-icon-noicon wmm-icon-yellow wmm-size-15"});
        
        let thermIcon = L.divIcon({className: "wmm-circle wmm-orange wmm-icon-noicon wmm-icon-orange wmm-size-15"});
        
        let humidityIcon = L.divIcon({className: "wmm-circle wmm-green wmm-icon-noicon wmm-icon-green wmm-size-15"});
        
        let windspeedIcon = L.divIcon({className: "wmm-circle wmm-purple wmm-icon-noicon wmm-icon-purple wmm-size-15"});

        let otherIcon = L.divIcon({className: "wmm-circle wmm-white wmm-icon-noicon wmm-icon-white wmm-size-15"});

        let nearbyIcon = L.divIcon({className: "wmm-pin wmm-altblue wmm-icon-circle wmm-icon-altblue wmm-size-15"});

        let sitePopupContent = `<b>Site:</b> ${this.site.site_no}`;
        let siteMarker = L.marker([this.site.latitude_dd, this.site.longitude_dd], {icon: siteIcon});
        siteMarker.bindPopup(sitePopupContent);
        this.markers.addLayer(siteMarker)

        siteMarker.desc = this.site.site_no;
        let self = this;
        let icon;
        this.siteFullInstruments.forEach(function(sensor){
            switch (sensor.deploymentType){
                case 'Barometric Pressure': 
                  icon = baroIcon;
                  self.baroSensorVisible = true;
                  break;
                case 'Water Temperature':
                  icon = waterTempIcon;
                  self.waterTempSensorVisible = true;
                  break;
                case 'Rapid Deployment': 
                  icon = rdgIcon;
                  self.rdgSensorVisible = true;
                  break;
                case 'Air Temperature':
                  icon = airTempIcon;
                  self.airTempSensorVisible = true;
                  break;
                case 'Wave Height': 
                  icon = waveIcon;
                  self.waveSensorVisible = true;
                  break;
                case 'Temperature': 
                  icon = thermIcon;
                  self.thermSensorVisible = true;
                  break;
                case 'Humidity':
                  icon = humidityIcon; 
                  self.humiditySensorVisible = true;
                  break;
                case 'Water Level':
                  icon = stormIcon;
                  self.stormSensorVisible = true;
                  break;
                case 'Windspeed':
                  icon = windspeedIcon;
                  self.windSensorVisible = true;
                  break;
                case '': 
                  icon = otherIcon;
                  self.otherSensorVisible = true;
                  break;
              }
            let sensorMarker = L.marker([self.site.latitude_dd, self.site.longitude_dd], {icon: icon});
            sensorMarker.desc = sensor.serial_number;
            sensorMarker.bindPopup(`<b>Deployment Type: </b>${sensor.deploymentType}<br><b>Serial Number:</b> ${sensor.serial_number !== "" ? sensor.serial_number : "---"}<br><b>Status: </b>${sensor.statusType}`)
            self.markers.addLayer(sensorMarker);
        })
        this.map.addLayer(this.markers);

        this.markers.on('clusterclick', function (a) {
            a.layer.spiderfy();
        });

        // Spiderify on load
        this.markers.zoomToShowLayer(siteMarker);

        // HWM markers
        this.hwm.forEach(function(mark){
            let hwmMarker = L.marker([mark.latitude_dd, mark.longitude_dd], {icon: hwmIcon});
            hwmMarker.data = {
                id: mark.hwm_id,
            }
            let hwmPopupContent = `<b>HWM:</b> ${mark.hwm_id}`
            hwmMarker.bindPopup(hwmPopupContent)
            self.markers.addLayer(hwmMarker)
        })

        // Proximity site markers
        this.siteService.getProximitySites(this.site.latitude_dd, this.site.longitude_dd, 0.05).subscribe((results) => {
            if(results.length > 0){
                results.forEach(function(site){
                    if(site.site_no !== self.site.site_no){
                        self.nearbySitesVisible = true;
                        let nearbySiteMarker = L.marker([site.latitude_dd, site.longitude_dd], {icon: nearbyIcon}).addTo(self.nearbySites);
                        nearbySiteMarker.data = {
                            id: site.site_no,
                        }
                        let nearbySitePopupContent = `<b>Nearby Site:</b> ${site.site_no}`
                        nearbySiteMarker.bindPopup(nearbySitePopupContent)
                    }
                })
            }
        });
    }

    toggleNearby() {
        // Toggle nearby sites layer with checkbox in legend
        if(this.nearbyToggled) {
            this.nearbySites.addTo(this.map);
        }else{
            if(this.map.hasLayer(this.nearbySites)){
                this.nearbySites.removeFrom(this.map);
            }
        }
    }

    openRefMarkDetailsDialog(row): void {
        // Format date established
        if(row.date_established !== undefined && !row.date_established.includes("/")){
            let estDate = row.date_established.split("T")[0];
            estDate = estDate.split("-");
            estDate = estDate[1] + "/" + estDate[2] + "/" + estDate[0];
            row.date_established = estDate;
        }

        // Format date recovered
        if(row.date_recovered !== undefined && !row.date_recovered.includes("/")){
            let recoveredDate = row.date_recovered.split("T")[0];
            recoveredDate = recoveredDate.split("-");
            recoveredDate = recoveredDate[1] + "/" + recoveredDate[2] + "/" + recoveredDate[0];
            row.date_recovered = recoveredDate;
        }

        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '80%';
        }
        else {
            dialogWidth = '30%';
        }

        const dialogRef = this.dialog.open(ReferenceMarkDialogComponent, {
            data: {
                row_data: row
            },
            width: dialogWidth,
        });
        dialogRef.afterClosed().subscribe((result) => {});
    }

    openHWMDetailsDialog(row): void {
        // Format surveyed date
        if(row.survey_date !== undefined && !row.survey_date.includes("/")){
            let surveyDate = row.survey_date.split("T")[0];
            surveyDate = surveyDate.split("-");
            surveyDate = surveyDate[1] + "/" + surveyDate[2] + "/" + surveyDate[0];
            row.survey_date = surveyDate;
        }

        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '80%';
        }
        else {
            dialogWidth = '30%';
        }

        const dialogRef = this.dialog.open(HwmDialogComponent, {
            data: {
                row_data: row,
            },
            width: dialogWidth,
        });
        dialogRef.afterClosed().subscribe((result) => {});
    }

    openSensorDetailsDialog(row): void {
        // Format dates
        let utcPreview;
        row.instrument_status.forEach(function(instrument){
            if(instrument.time_stamp !== undefined && !instrument.time_stamp.includes("/")){
                if(instrument.status === 'Deployed'){
                    if(instrument.time_zone !== 'UTC'){
                        let localTime = DateTime.fromISO(instrument.time_stamp, {zone: instrument.time_zone})
                        utcPreview = localTime.setZone("UTC").toString();
                    }
                  }
                let timestamp = instrument.time_stamp.split("T")[0];
                let time = instrument.time_stamp.split("T")[1];
                time = time.split (':')
                timestamp = timestamp.split("-");
                timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + time[0] + ":" + time[1];
                instrument.time_stamp = timestamp;
            }
        })

        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '80%';
        }
        else {
            dialogWidth = '30%';
        }

        const dialogRef = this.dialog.open(SensorDialogComponent, {
            data: {
                row_data: row,
                utcPreview: utcPreview,
            },
            width: dialogWidth,
        });
        dialogRef.afterClosed().subscribe((result) => {});
    }

    openPeaksDetailsDialog(row): void {
        console.log(row)
    }

    openFileDetailsDialog(row, type): void {
        // Format photo date
        if(row.photo_date !== undefined && !row.photo_date.includes("/")){
            let photoDate = row.photo_date.split("T")[0];
            photoDate = photoDate.split("-");
            photoDate = photoDate[1] + "/" + photoDate[2] + "/" + photoDate[0];
            row.photo_date = photoDate;
        }

        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '80%';
        }
        else {
            dialogWidth = '30%';
        }

        const dialogRef = this.dialog.open(FileDetailsDialogComponent, {
            data: {
                row_data: row,
                type: type,
                siteInfo: this.site
            },
            width: dialogWidth,
        });
        dialogRef.afterClosed().subscribe((result) => {});
    }

    openEditDialog(){
        let siteHousing = [{
            amount: null,
            notes: null,
            housingType: null,
            material: null,
            length: null,
        }];
        this.siteHousing.forEach(function(value){
            siteHousing[0].amount = value.amount !== undefined && value.amount !== "" ? value.amount : null;
            siteHousing[0].notes = value.notes !== undefined && value.notes !== "" ? value.notes : null;
            siteHousing[0].housingType = value.housingType !== undefined && value.housingType !== "" ? value.housingType : null;
            siteHousing[0].material = value.material !== undefined && value.material !== "" ? value.material : null;
            siteHousing[0].length = value.length !== undefined && value.length !== "" ? value.length : null;
        })

        if(this.currentUser !== ''){
            const dialogRef = this.dialog.open(SiteEditComponent, {
                data: {
                    site: this.site,
                    networkType: this.networkType,
                    networkName: this.networkName,
                    hdatum: this.hdatum,
                    hmethod: this.hmethod,
                    hdatumList: this.hdatumList,
                    hmethodList: this.hmethodList,
                    siteFiles: this.siteFiles,
                    siteHousing: siteHousing,
                    memberName: this.memberName,
                    priority: this.priority,
                    landowner: this.landownerContact,
                },
                disableClose: true,
            });
            dialogRef.afterClosed().subscribe((result) => {});
        }
    }
}
