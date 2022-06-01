import { Component, OnInit, ViewChild } from '@angular/core';
import { MAP_CONSTANTS } from '@app/map/map-constants';
import {
    Router,
    ActivatedRoute,
    ParamMap,
    NavigationEnd,
} from '@angular/router';
import { SiteService } from '@services/site.service';
import { CurrentUserService } from '@services/current-user.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';
import { ReferenceDatumDialogComponent } from '@app/reference-datum-dialog/reference-datum-dialog.component';
import { SensorDialogComponent } from '@app/sensor-dialog/sensor-dialog.component';
import { HwmDialogComponent } from '@app/hwm-dialog/hwm-dialog.component';
import { HwmEditService } from '@app/services/hwm-edit.service';
import { FileDetailsDialogComponent } from '@app/file-details-dialog/file-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
declare let L: any;
import 'leaflet';
import { DateTime } from "luxon";
import { marker } from 'leaflet';
import { SiteEditComponent } from '@app/site-edit/site-edit.component';
import { ResultDetailsComponent } from '@app/result-details/result-details.component';
import { networkInterfaces } from 'os';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { RefDatumEditComponent } from '@app/ref-datum-edit/ref-datum-edit.component';
import { OpEditService } from '@app/services/op-edit.service';
import { SensorEditComponent } from '@app/sensor-edit/sensor-edit.component';
import { SensorEditService } from '@app/services/sensor-edit.service';
import { TimezonesService } from '@app/services/timezones.service';
import { HwmEditComponent } from '@app/hwm-edit/hwm-edit.component';
import { PeakDialogComponent } from '@app/peak-dialog/peak-dialog.component';
import { PeakEditComponent } from '@app/peak-edit/peak-edit.component';
import { FiltersService } from '@app/services/filters.service';
import { FileEditComponent } from '@app/file-edit/file-edit.component';
import { ConfirmComponent } from '@app/confirm/confirm.component';
import { FileEditService } from '@app/services/file-edit.service';

@Component({
    selector: 'app-site-details',
    templateUrl: './site-details.component.html',
    styleUrls: ['./site-details.component.scss'],
})
export class SiteDetailsComponent implements OnInit {
    @ViewChild('paginator') paginator: MatPaginator;
    @ViewChild('sensorPaginator') sensorPaginator: MatPaginator;
    @ViewChild('hwmPaginator') hwmPaginator: MatPaginator;
    @ViewChild('peaksPaginator') peaksPaginator: MatPaginator;
    @ViewChild('siteFilesPaginator') siteFilesPaginator: MatPaginator;
    @ViewChild('hwmFilesPaginator') hwmFilesPaginator: MatPaginator;
    @ViewChild('refMarkFilesPaginator') refMarkFilesPaginator: MatPaginator;
    @ViewChild('sensorFilesPaginator') sensorFilesPaginator: MatPaginator;
    @ViewChild('sensorSort', { static: false }) sensorSort: MatSort;
    @ViewChild('hwmSort', { static: false }) hwmSort: MatSort;
    @ViewChild('refMarkSort', { static: false }) refMarkSort: MatSort;
    @ViewChild('peaksSort', { static: false }) peaksSort: MatSort;
    @ViewChild('refMarkFilesSort', { static: false }) refMarkFilesSort: MatSort;
    @ViewChild('hwmFilesSort', { static: false }) hwmFilesSort: MatSort;
    @ViewChild('sensorFilesSort', { static: false }) sensorFilesSort: MatSort;
    @ViewChild('siteFilesSort', { static: false }) siteFilesSort: MatSort;
    
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
    public referenceDatums = [];
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
    public siteMarker;
    
    refMarkDataSource = new MatTableDataSource<any>();
    sensorDataSource = new MatTableDataSource<any>();
    hwmDataSource = new MatTableDataSource<any>();
    peaksDataSource = new MatTableDataSource<any>();
    refMarkFilesDataSource = new MatTableDataSource<any>();
    sensorFilesDataSource = new MatTableDataSource<any>();
    hwmFilesDataSource = new MatTableDataSource<any>();
    siteFilesDataSource = new MatTableDataSource<any>();
    blankFileDataSource = new MatTableDataSource<any>();
    blankDataSource = new MatTableDataSource<any>();

    siteFilesExpanded = true;
    hwmFilesExpanded = true;
    refDatumFilesExpanded = true;
    sensorFilesExpanded = true;

    sortedSensorData = [];
    sortedHWMData = [];
    sortedPeaksData = [];
    sortedRefMarkData = [];
    sortedRefMarkFilesData = [];
    sortedSensorFilesData = [];
    sortedHWMFilesData = [];
    sortedSiteFilesData = [];
    
    gridListWidth;
    lowerColumns;
    innerWidth;
    rowHeight;
    lowerHeight;
    rowspan;
    
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
    role = localStorage.role;
    // Disable edit button for some roles
    editDisabled = this.role !== '3' && this.role !== '2' && this.role !== '1';
    deleteDisabled = this.role !== '1';

    displayedColumns: string[] = [
        'HousingType',
        'HousingLength',
        'HousingMaterial',
        'Amount',
        'Notes',
    ];

    displayedSensorColumns: string[] = [
        'serial_number',
        'eventName',
        'deploymentType',
        'sensorType',
        'statusType',
        'button',
    ];

    displayedHWMColumns: string[] = [
        'hwm_id',
        'hwm_label',
        'flag_date',
        'elev_ft',
        'button',
    ];

    displayedPeakColumns: string[] = [
        'PeakEventName',
        'PeakStage',
        'PeakDate',
        'button',
    ];

    displayedSiteFileColumns: string[] = [
        'FileDate',
        'FileName',
        'button',
    ];

    displayedDatumFileColumns: string[] = [
        'FileDate',
        'FileName',
        'FileDatum',
        'button',
    ];

    displayedSensorFileColumns: string[] = [
        'FileDate',
        'FileName',
        'FileSerialNum',
        'button',
    ];

    displayedHWMFileColumns: string[] = [
        'FileDate',
        'FileName',
        'button',
    ];

    displayedRMColumns: string[] = [
        'RefMarkName',
        'RefMarkEl',
        'Description',
        'button',
    ];

    constructor(
        private route: ActivatedRoute,
        public siteService: SiteService,
        public currentUserService: CurrentUserService,
        public timezonesService: TimezonesService,
        public dialog: MatDialog,
        public filtersService: FiltersService,
        public fileEditService: FileEditService,
        public hwmEditService: HwmEditService,
        public opEditService: OpEditService,
        public sensorEditService: SensorEditService,
    ) {
        currentUserService.currentUser.subscribe((user) => {
            this.currentUser = user;
        });
    }

    ngOnInit(): void {
        // Breakpoints for mat-grid-tile columns/rows
        this.innerWidth = window.innerWidth;
        if(window.innerWidth <= 768){
            this.gridListWidth = 1;
            this.lowerColumns = 1;
            this.rowHeight = "1:0.8";
            this.rowspan = "2";
            this.lowerHeight = "1:1";
        }else if(window.innerWidth > 768 && window.innerWidth <= 875){
            this.gridListWidth = 1;
            this.lowerColumns = 1;
            this.rowHeight = "1:1";
            this.rowspan = "2";
            this.lowerHeight = "1:0.8";
        }else if(window.innerWidth > 875 && window.innerWidth <= 1050){
            this.gridListWidth = 1;
            this.lowerColumns = 2;
            this.rowHeight = "1:0.3";
            this.rowspan = "2";
            this.lowerHeight = "1:0.4";
        }else if(window.innerWidth > 875 && window.innerWidth <= 1485){
            this.gridListWidth = 2;
            this.lowerColumns = 2;
            this.rowHeight = "1:0.8";
            this.rowspan = "2";
            this.lowerHeight = "1:0.4";
        }else{
            this.gridListWidth = 2;
            this.lowerColumns = 3;
            this.rowHeight = "2:0.8";
            this.rowspan = "1";
            this.lowerHeight = "1:0.75";
        }

        this.route.params.subscribe(routeParams => {
            this.siteID = routeParams.id
        })

        // Display a blank row if no files or table info
        this.blankFileDataSource.data = [{format_file_date: "---", name: "---"}];
        this.blankDataSource.data = [{file_date: "---", name: "---"}];
        this.getEvent();
    }

    ngAfterViewInit(): void {
        this.sensorDataSource.sort = this.sensorSort;
        this.hwmDataSource.sort = this.hwmSort;
        this.refMarkDataSource.sort = this.refMarkSort; 
        this.peaksDataSource.sort = this.peaksSort;
        this.refMarkFilesDataSource.sort = this.refMarkSort;
        this.sensorFilesDataSource.sort = this.sensorFilesSort;
        this.hwmFilesDataSource.sort = this.hwmFilesSort;
        this.siteFilesDataSource.sort = this.siteFilesSort;
    }

    onResize(event) {
        if(event.target.innerWidth !== this.innerWidth){
            this.innerWidth = event.target.innerWidth;
            if(this.innerWidth <= 768){
                this.gridListWidth = 1;
                this.lowerColumns = 1;
                this.rowHeight = "1:0.8";
                this.rowspan = "2";
                this.lowerHeight = "1:1";
            }else if(this.innerWidth > 768 && this.innerWidth <= 875){
                this.gridListWidth = 1;
                this.lowerColumns = 1;
                this.rowHeight = "1:1";
                this.rowspan = "2";
                this.lowerHeight = "1:0.8";
            }else if(this.innerWidth > 875 && this.innerWidth <= 1050){
                this.gridListWidth = 1;
                this.lowerColumns = 2;
                this.rowHeight = "1:0.3";
                this.rowspan = "2";
                this.lowerHeight = "1:0.4";
            }else if(this.innerWidth > 875 && this.innerWidth <= 1485){
                this.gridListWidth = 2;
                this.lowerColumns = 2;
                this.rowHeight = "1:0.8";
                this.rowspan = "2";
                this.lowerHeight = "1:0.4";
            }else{
                this.gridListWidth = 2;
                this.lowerColumns = 3;
                this.rowHeight = "2:0.8";
                this.rowspan = "1";
                this.lowerHeight = "1:0.75";
            }
        }
    }

    getEvent() {
        let self = this;
        this.filtersService.getCurrentFilters().subscribe(result => this.currentEvent = result.event_id)

        // Get event name
        this.siteService
            .getSiteEvents(this.siteID)
            .subscribe((results) => {
                if(self.currentEvent === null){
                    this.event = "All Events";
                    this.getData();
                }else{
                    if(results.length > 0){
                        results.forEach(function(result){
                            if (self.currentEvent == result.event_id){
                                self.event = result.event_name;
                                self.getData();
                            }
                        })
                    }
                }

            });
    }

    getData() {
        let self = this;

        this.siteService
            .getSingleSite(this.siteID)
            .subscribe((results) => {
                if(results.length === undefined || results.length > 0){
                    this.site = results;
                    this.noSiteInfo = false;
                    this.toggleSiteMap();

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

                    // Get reference datums
                    this.siteService
                    .getObjectivePoints(this.siteID)
                    .subscribe((results) => {
                        if(results.length > 0){
                            results.forEach(function(result){
                                self.referenceDatums.push(result);
                            })
                            this.refMarkDataSource.data = this.referenceDatums;
                            this.refMarkDataSource.paginator = this.paginator;
                        }

                    });

                    // Get deployment priority
                    this.siteService
                    .getDepPriority(this.siteID)
                    .subscribe((results) => {
                        this.priority = results;
                    });

                    // If no event selected
                    if(this.currentEvent === null){
                        // Get site full instruments
                        this.siteService
                        .getSiteFullInstruments(this.siteID)
                        .subscribe((results) => {
                                let self = this;
                                this.siteFullInstruments = results;

                                if(results.length > 0){
                                    this.siteFullInstruments.forEach(function(result, i){
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
                                    this.sensorDataSource.data = this.siteFullInstruments;
                                    this.sensorDataSource.paginator = this.sensorPaginator;
                                    this.getSensorsForMap();
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
                                    hwm.format_flag_date = flagDate;

                                    // Get event name for sensor using sensor_id
                                    self.siteService
                                    .getHWMEvents(hwm.hwm_id)
                                    .subscribe((eventResults) => {
                                        hwm.eventName = eventResults.event_name;
                                    })
                                })
                                this.hwmDataSource.data = this.hwm;
                                this.hwmDataSource.paginator = this.hwmPaginator;
                                this.getHWMsForMap();
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
                                file.format_file_date = fileDate;
                                if(file.photo_date){
                                    let photoDate = file.photo_date.split("T")[0];
                                    photoDate = photoDate.split("-");
                                    photoDate = photoDate[1] + "/" + photoDate[2] + "/" + photoDate[0];
                                    file.format_photo_date = photoDate;
                                }
                                if(file.instrument_id !== undefined){
                                    self.siteService.getFileSensor(file.file_id).subscribe((results) => {
                                        file.details = results;
                                        self.sensorFiles.push(file);
                                        // Wait for all files to finish being retrieved before loading table
                                        if (self.files.length === (self.sensorFiles.length + self.hwmFiles.length + self.siteFiles.length + self.datumLocFiles.length)){
                                            self.sensorFilesDone = true;
                                            self.sensorFilesDataSource.data = self.sensorFiles;
                                            self.sensorFilesDataSource.paginator = self.sensorFilesPaginator;
                                        }
                                    });
                                }else if (file.hwm_id !== undefined){
                                    self.hwmFiles.push(file);
                                }else if (file.objective_point_id !== undefined){
                                    // Add rd name to result
                                    self.refMarkDataSource.data.forEach(function(rd){
                                        if(rd.objective_point_id === file.objective_point_id){
                                            file.rd_name = rd.name;
                                        }
                                    })
                                    self.datumLocFiles.push(file);
                                }else{
                                    self.siteFiles.push(file);
                                }
                            });
                            this.siteFilesDataSource.data = this.siteFiles;
                            this.siteFilesDataSource.paginator = this.siteFilesPaginator;

                            this.refMarkFilesDataSource.data = this.datumLocFiles;
                            this.refMarkFilesDataSource.paginator = this.refMarkFilesPaginator;

                            this.hwmFilesDataSource.data = this.hwmFiles;
                            this.hwmFilesDataSource.paginator = this.hwmFilesPaginator;
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
                                    this.siteFullInstruments.forEach(function(result, i){
                                        self.siteService
                                        // Get each sensor status id and match to status type in lookup
                                        .getStatus(result.instrument_id)
                                        .subscribe((statusID) => {
                                            result.statusID = statusID.status_type_id;
                                            statusResults.forEach(function(status){
                                                if (result.statusID === status.status_type_id){
                                                    result.statusType = status.status;
                                                    self.siteFullInstruments = self.siteFullInstruments.filter(({ statusType }) => statusType !== 'Proposed');
                                                    if(self.sensorDataSource.data !== self.siteFullInstruments){
                                                        self.sensorDataSource.data = self.siteFullInstruments;
                                                        self.sensorDataSource.paginator = self.sensorPaginator;
                                                    }
                                                }
                                            });
                                        })
                                    });
                                    this.getSensorsForMap();
                                })
                                // Full instrument info
                                this.siteFullInstruments.forEach(function(result){
                                    self.siteService
                                    .getFullSensor(result.instrument_id)
                                    .subscribe((sensorResults) => {
                                        result.sensorBrand = sensorResults.sensorBrand;
                                        result.sensorType = sensorResults.sensorType;
                                        result.instrument_status = sensorResults.instrument_status;
                                    })
                                });
                                this.sensorDataSource.data = this.siteFullInstruments;
                                this.sensorDataSource.paginator = this.sensorPaginator;
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
                                    hwm.format_flag_date = flagDate;
                                })
                                this.hwmDataSource.data = this.hwm;
                                this.hwmDataSource.paginator = this.hwmPaginator;
                                this.getHWMsForMap();
                            }

                        });

                        //  Get Event files for sensor and hwm
                        this.siteService.getSiteEventFiles(this.siteID, this.currentEvent).subscribe((results) => {
                            this.files = results;
                            this.files.forEach(function(file){
                                let fileDate = file.file_date.split("T")[0];
                                fileDate = fileDate.split("-");
                                fileDate = fileDate[1] + "/" + fileDate[2] + "/" + fileDate[0];
                                file.format_file_date = fileDate;
                                if(file.photo_date){
                                    let photoDate = file.photo_date.split("T")[0];
                                    photoDate = photoDate.split("-");
                                    photoDate = photoDate[1] + "/" + photoDate[2] + "/" + photoDate[0];
                                    file.format_photo_date = photoDate;
                                }
                                if(file.instrument_id !== undefined){
                                    self.siteService.getFileSensor(file.file_id).subscribe((results) => {
                                        file.details = results;
                                        self.sensorFiles.push(file);
                                        self.fileLength ++;

                                        // Wait for all files to finish being retrieved before loading table
                                        if (self.files.length === (self.sensorFiles.length + self.hwmFiles.length)){
                                            self.sensorFilesDone = true;
                                            
                                            self.sensorFilesDataSource.data = self.sensorFiles;
                                            self.sensorFilesDataSource.paginator = self.sensorFilesPaginator;
                                        }
                                    });
                                }else if (file.hwm_id !== undefined){
                                    self.hwmFiles.push(file);
                                    self.fileLength ++;
                                }
                            });

                            this.hwmFilesDataSource.data = this.hwmFiles;
                            this.hwmFilesDataSource.paginator = this.hwmFilesPaginator;
                        });

                        // Get site and datum location files not associated with an event
                        this.siteService.getSiteFiles(this.siteID).subscribe((results) => {
                            let files = results;
                            files.forEach(function(file){
                                let fileDate = file.file_date.split("T")[0];
                                fileDate = fileDate.split("-");
                                fileDate = fileDate[1] + "/" + fileDate[2] + "/" + fileDate[0];
                                file.format_file_date = fileDate;
                                if(file.photo_date){
                                    let photoDate = file.photo_date.split("T")[0];
                                    photoDate = photoDate.split("-");
                                    photoDate = photoDate[1] + "/" + photoDate[2] + "/" + photoDate[0];
                                    file.format_photo_date = photoDate;
                                }
                                if (file.objective_point_id !== undefined){
                                    // Add rd name to result
                                    self.refMarkDataSource.data.forEach(function(rd){
                                        if(rd.objective_point_id === file.objective_point_id){
                                            file.rd_name = rd.name;
                                        }
                                    })
                                    self.datumLocFiles.push(file);
                                    self.fileLength ++;
                                }else if (file.hwm_id === undefined && file.instrument_id === undefined){
                                    self.siteFiles.push(file);
                                    self.fileLength ++;
                                }
                            });
                            this.siteFilesDataSource.data = this.siteFiles;
                            this.siteFilesDataSource.paginator = this.siteFilesPaginator;

                            this.refMarkFilesDataSource.data = this.datumLocFiles;
                            this.refMarkFilesDataSource.paginator = this.refMarkFilesPaginator;
                        });

                    }

                    // Get Peaks
                    this.siteService
                    .getPeakSummaryView(this.siteID)
                    .subscribe((results) => {
                        if(results.length > 0){
                            results.forEach(function(result){
                                if (self.currentEvent === null || result.event_name === self.event){
                                    result.format_peak_date = self.setTimeAndDate(result.peak_date);
                                    self.peaks.push(result);
                                }
                            }) 
                        }
                        this.peaksDataSource.data = this.peaks;
                        this.peaksDataSource.paginator = this.peaksPaginator;
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

    setTimeAndDate(time_stamp) {
        let hour = (time_stamp.split('T')[1]).split(':')[0];
        let ampm;
        if(hour > 12){
          hour = String(hour - 12).padStart(2, '0');
          ampm = "PM";
        }else{
          if(String(hour) === '00'){
            hour = '12';
            ampm = "AM";
          }else{
            hour = String(hour).padStart(2, '0');
            ampm = "AM";
          }
        }
        // minute
        let minute = time_stamp.split('T')[1].split(':')[1];
        minute = String(minute).padStart(2, '0');
        let timestamp = time_stamp.split("T")[0];
        timestamp = timestamp.split("-");
        timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + hour + ":" + minute + " " + ampm;
        return timestamp;
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
        let self = this;
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

        let siteIcon = L.divIcon({className: "wmm-pin wmm-altblue wmm-icon-circle wmm-icon-white wmm-size-20"});

        let nearbyIcon = L.divIcon({className: "wmm-pin wmm-altblue wmm-icon-circle wmm-icon-altblue wmm-size-15"});

        let sitePopupContent = `<b>Site:</b> ${this.site.site_no}`;
        this.siteMarker = L.marker([this.site.latitude_dd, this.site.longitude_dd], {icon: siteIcon});
        this.siteMarker.bindPopup(sitePopupContent);
        this.markers.addLayer(this.siteMarker)

        this.siteMarker.desc = this.site.site_no;
       
        this.map.addLayer(this.markers);

        this.markers.on('clusterclick', function (a) {
            a.layer.spiderfy();
        });

        // Spiderify on load
        this.markers.zoomToShowLayer(this.siteMarker);

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

        // If no sensors or hwms, need this to correctly display site marker
        if (this.map) {
            var map = this.map;
            setTimeout(function () {
                map.invalidateSize();
            }, 100);
        }
    }

    getSensorsForMap() {
        // Sensor Icons
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
                default: 
                  icon = otherIcon;
                  self.otherSensorVisible = true;
              }
            let sensorMarker = L.marker([self.site.latitude_dd, self.site.longitude_dd], {icon: icon});
            sensorMarker.desc = sensor.serial_number;
            let deploymentType = sensor.deploymentType !== undefined && sensor.deploymentType !== null && sensor.deploymentType !== "" ? sensor.deploymentType : "---";
            let statusType = sensor.statusType !== undefined && sensor.statusType !== null && sensor.statusType !== "" ? sensor.statusType : "---";
            sensorMarker.bindPopup(`<b>Deployment Type: </b>${deploymentType}<br><b>Serial Number:</b> ${sensor.serial_number !== "" ? sensor.serial_number : "---"}<br><b>Status: </b>${statusType}`)
            self.markers.addLayer(sensorMarker);
            
            self.map.invalidateSize();

            // Spiderify
            self.markers.zoomToShowLayer(self.siteMarker);
        })
    }

    getHWMsForMap() {
        let hwmIcon = L.divIcon({className: "wmm-diamond wmm-altred wmm-icon-noicon wmm-icon-red wmm-size-15"});

        let self = this;
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
        
        this.map.invalidateSize();
        
        // Spiderify
        this.markers.zoomToShowLayer(this.siteMarker);
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

    /* istanbul ignore next */
    openRefMarkDetailsDialog(row): void {
        // Format date established
        if(row.date_established !== undefined && !row.date_established.includes("/")){
            let estDate = row.date_established.split("T")[0];
            estDate = estDate.split("-");
            estDate = estDate[1] + "/" + estDate[2] + "/" + estDate[0];
            row.date_established_format = estDate;
        }

        // Format date recovered
        if(row.date_recovered !== undefined && !row.date_recovered.includes("/")){
            let recoveredDate = row.date_recovered.split("T")[0];
            recoveredDate = recoveredDate.split("-");
            recoveredDate = recoveredDate[1] + "/" + recoveredDate[2] + "/" + recoveredDate[0];
            row.date_recovered_format = recoveredDate;
        }

        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '100%';
        }
        else {
            dialogWidth = '40%';
        }

        const dialogRef = this.dialog.open(ReferenceDatumDialogComponent, {
            data: {
                row_data: row
            },
            width: dialogWidth,
        });
    }

    /* istanbul ignore next */
    openRefDatumEditDialog(row): void {
        let self = this;
        const dialogRef = this.dialog.open(RefDatumEditComponent, {
            data: {
                rd: row,
                hdatumList: this.hdatumList,
                hmethodList: this.hmethodList,
                files: this.refMarkFilesDataSource.data,
                site_id: this.site.site_id,
                rdSite: this.site,
            },
            width: '100%',
            autoFocus: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if(result.result && result.editOrCreate === "Edit") {
                if(result.result.referenceDatums !== null){
                    this.refMarkDataSource.data.forEach(function(row, i){
                        if(row.objective_point_id === result.result.referenceDatums.objective_point_id){
                            // replace row with new info
                            self.refMarkDataSource.data = [result.result.referenceDatums];
                        }
                    });
                }
            } else if(result.result && result.editOrCreate === "Create") {
                self.refMarkDataSource.data.push(result.result.referenceDatums); 
                self.refMarkDataSource.data = [...self.refMarkDataSource.data];
            }
        });
    }

    /* istanbul ignore next */
    deleteRD(row): void {
        let self = this;
        // First check if any sensors are using this reference datum
        self.opEditService
        .getOPMeasurements(row.objective_point_id)
        .subscribe((results) => {
            if (results.length > 0) {
                // If there are sensors using the reference datum
                this.dialog.open(ConfirmComponent, {
                    data: {
                    title: "Cannot Delete",
                    titleIcon: "close",
                    message: "This Reference Datum is being used for one or more sensor tape downs. Please delete the tape down before deleting the reference datum.",
                    confirmButtonText: "OK",
                    showCancelButton: true,
                    },
                });
            }else{
                // If no sensors are using the reference datum
                const dialogRef = this.dialog.open(ConfirmComponent, {
                    data: {
                    title: "Remove Reference Datum",
                    titleIcon: "close",
                    message: "Are you sure you want to remove this Reference Datum: " + row.name,
                    confirmButtonText: "OK",
                    showCancelButton: true,
                    },
                });
                dialogRef.afterClosed().subscribe((result) => {
                    if(result) {
                        // Delete reference datum
                        this.opEditService.deleteRD(row.objective_point_id).subscribe((results) => {
                            if(results === null){
                                // Update reference datum data source
                                self.refMarkDataSource.data.forEach(function(rd, i){
                                    if(rd.objective_point_id === row.objective_point_id){
                                        self.refMarkDataSource.data.splice(i, 1);
                                        self.refMarkDataSource.data = [...self.refMarkDataSource.data];
                                    }
                                })
                                // Update files data source
                                self.refMarkFilesDataSource.data.forEach(function(file, i){
                                    if(file.objective_point_id === row.objective_point_id){
                                        self.refMarkFilesDataSource.data.splice(i, 1);
                                        self.refMarkFilesDataSource.data = [...self.refMarkFilesDataSource.data];
                                    }
                                })
                                // Update site files data source
                                self.siteFilesDataSource.data.forEach(function(file, i){
                                    if(file.objective_point_id === row.objective_point_id){
                                        self.siteFilesDataSource.data.splice(i, 1);
                                        self.siteFilesDataSource.data = [...self.siteFilesDataSource.data];
                                    }
                                })
                                // Update site files count
                                self.siteFiles.forEach(function(file, i){
                                    if(file.objective_point_id === row.objective_point_id){
                                        self.siteFiles.splice(i, 1);
                                        self.siteFiles = [...self.siteFiles];
                                    }
                                })
                                // success
                                this.dialog.open(ConfirmComponent, {
                                    data: {
                                    title: "",
                                    titleIcon: "close",
                                    message: "Successfully removed Reference Datum",
                                    confirmButtonText: "OK",
                                    showCancelButton: false,
                                    },
                                });
                            }else{
                                // error
                                this.dialog.open(ConfirmComponent, {
                                    data: {
                                    title: "Error",
                                    titleIcon: "close",
                                    message: "Error removing Reference Datum",
                                    confirmButtonText: "OK",
                                    showCancelButton: false,
                                    },
                                });
                            }
                        })
                    }
                });
            }
        });
    }

    /* istanbul ignore next */
    openHWMDetailsDialog(row): void {
        // Format surveyed date
        if(row.survey_date !== undefined && !row.survey_date.includes("/")){
            let surveyDate = row.survey_date.split("T")[0];
            surveyDate = surveyDate.split("-");
            surveyDate = surveyDate[1] + "/" + surveyDate[2] + "/" + surveyDate[0];
            row.format_survey_date = surveyDate;
        }

        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '100%';
        }
        else {
            dialogWidth = '40%';
        }

        const dialogRef = this.dialog.open(HwmDialogComponent, {
            data: {
                row_data: row,
            },
            width: dialogWidth,
        });
        dialogRef.afterClosed().subscribe((result) => {});
    }

    /* istanbul ignore next */
    openHWMEditDialog(row): void {
        const dialogRef = this.dialog.open(HwmEditComponent, {
            data: {
                hwm: row,
                files: this.hwmFilesDataSource.data,
                site_id: this.site.site_id,
                hdatumList: this.hdatumList,
                hmethodList: this.hmethodList,
                event_id: this.currentEvent,
                event: this.event,
                hwmSite: this.site,
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            let self = this;
            if(result.result && result.editOrCreate === "Edit") {
                this.hwmDataSource.data.forEach(function(hwm, i){
                    if(hwm.hwm_id === result.result.hwm_id){
                        self.hwmDataSource.data[i] = result.result; 
                        self.hwmDataSource.data = [...self.hwmDataSource.data];
                    }
                })
            }
            else if(result.result && result.editOrCreate === "Create") {
                self.hwmDataSource.data.push(result.result); 
                self.hwmDataSource.data = [...self.hwmDataSource.data];
            }
        });
    }

    /* istanbul ignore next */
    deleteHWM(row): void {
        let self = this;
        const dialogRef = this.dialog.open(ConfirmComponent, {
            data: {
              title: "Remove HWM",
              titleIcon: "close",
              message: "Are you sure you want to remove this HWM? Flagged on: " + row.format_flag_date,
              confirmButtonText: "OK",
              showCancelButton: true,
            },
          });
        dialogRef.afterClosed().subscribe((result) => {
            if(result) {
                // Delete hwm
                this.hwmEditService.deleteHWM(row.hwm_id).subscribe((results) => {
                    if(results === null){
                        // Update hwm data source
                        self.hwmDataSource.data.forEach(function(hwm, i){
                            if(hwm.hwm_id === row.hwm_id){
                                self.hwmDataSource.data.splice(i, 1);
                                self.hwmDataSource.data = [...self.hwmDataSource.data];
                            }
                        })
                        // Update files data source
                        self.hwmFilesDataSource.data.forEach(function(file, i){
                            if(file.hwm_id === row.hwm_id){
                                self.hwmFilesDataSource.data.splice(i, 1);
                                self.hwmFilesDataSource.data = [...self.hwmFilesDataSource.data];
                            }
                        })
                        // Update site files data source
                        self.siteFilesDataSource.data.forEach(function(file, i){
                            if(file.hwm_id === row.hwm_id){
                                self.siteFilesDataSource.data.splice(i, 1);
                                self.siteFilesDataSource.data = [...self.siteFilesDataSource.data];
                            }
                        })
                        // Update site files count
                        self.siteFiles.forEach(function(file, i){
                            if(file.hwm_id === row.hwm_id){
                                self.siteFiles.splice(i, 1);
                                self.siteFiles = [...self.siteFiles];
                            }
                        })
                        // success
                        this.dialog.open(ConfirmComponent, {
                            data: {
                            title: "",
                            titleIcon: "close",
                            message: "Successfully removed HWM",
                            confirmButtonText: "OK",
                            showCancelButton: false,
                            },
                        });
                    }else{
                        // error
                        this.dialog.open(ConfirmComponent, {
                            data: {
                            title: "Error",
                            titleIcon: "close",
                            message: "Error removing HWM",
                            confirmButtonText: "OK",
                            showCancelButton: false,
                            },
                        });
                    }
                })
            }
        });
    }

    /* istanbul ignore next */
    openSensorDetailsDialog(row): void {
        // Format dates
        let self = this;
        let utcPreview;
        row.instrument_status.forEach(function(instrument){
            if(instrument.time_stamp !== undefined && !instrument.time_stamp.includes("/")){
                let hour = (instrument.time_stamp.split('T')[1]).split(':')[0];
                let ampm;
                if(hour > 12){
                    hour = String(hour - 12).padStart(2, '0');
                    ampm = "PM";
                }else{
                    hour = hour;
                    ampm = "AM";
                }
                if(instrument.status === 'Deployed'){
                    let minute = ((instrument.time_stamp.split('T')[1]).split(":")[1]).split(":")[0];
                    utcPreview = self.timezonesService.convertTimezone(instrument.time_zone, instrument.time_stamp, minute);
                    utcPreview = utcPreview.replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '/');
                }
                let timestamp = instrument.time_stamp.split("T")[0];
                let time = instrument.time_stamp.split("T")[1];
                time = time.split(':');
                timestamp = timestamp.split("-");
                timestamp = timestamp[1] + "/" + timestamp[2] + "/" + timestamp[0] + " " + hour + ":" + time[1] + " " + ampm;
                instrument.format_time_stamp = timestamp;
            }
        })

        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '100%';
        }
        else {
            dialogWidth = '40%';
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

    /* istanbul ignore next */
    openSensorEditDialog(row): void {
        let self = this;
        const dialogRef = this.dialog.open(SensorEditComponent, {
            data: {
                sensor: row,
                files: this.sensorFilesDataSource.data,
                site_id: this.site.site_id,
                siteRefMarks: this.refMarkDataSource.data,
                event_id: this.currentEvent,
                event: this.event,
            },
            width: '100%',
            autoFocus: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result.result && result.editOrCreate === "Edit"){
                this.sensorDataSource.data.forEach(function(sensor, i){
                    if(sensor.instrument_id === result.result.instrument_id){
                        self.sensorDataSource.data[i] = result.result; 
                        self.sensorDataSource.data = [...self.sensorDataSource.data];
                    }
                })
            }
            else if(result.result && result.editOrCreate === "Create") {
                self.sensorDataSource.data.push(result.result); 
                self.sensorDataSource.data = [...self.sensorDataSource.data];
            }
        });
    }

    /* istanbul ignore next */
    deleteSensor(row): void {
        let self = this;
        const dialogRef = this.dialog.open(ConfirmComponent, {
            data: {
              title: "Remove Sensor",
              titleIcon: "close",
              message: "Are you sure you want to remove this Sensor?" + row.deploymentType,
              confirmButtonText: "OK",
              showCancelButton: true,
            },
          });
        dialogRef.afterClosed().subscribe((result) => {
            if(result) {
                // Delete sensor
                this.sensorEditService.deleteInstrument(row.instrument_id).subscribe((results) => {
                    if(results === null){
                        // Update hwm data source
                        self.sensorDataSource.data.forEach(function(sensor, i){
                            if(sensor.instrument_id === row.instrument_id){
                                self.sensorDataSource.data.splice(i, 1);
                                self.sensorDataSource.data = [...self.sensorDataSource.data];
                            }
                        })
                        // Update files data source
                        self.sensorFilesDataSource.data.forEach(function(file, i){
                            if(file.instrument_id === row.instrument_id){
                                self.sensorFilesDataSource.data.splice(i, 1);
                                self.sensorFilesDataSource.data = [...self.sensorFilesDataSource.data];
                            }
                        })
                        // Update site files data source
                        self.siteFilesDataSource.data.forEach(function(file, i){
                            if(file.instrument_id === row.instrument_id){
                                self.siteFilesDataSource.data.splice(i, 1);
                                self.siteFilesDataSource.data = [...self.siteFilesDataSource.data];
                            }
                        })
                        // Update site files count
                        self.siteFiles.forEach(function(file, i){
                            if(file.instrument_id === row.instrument_id){
                                self.siteFiles.splice(i, 1);
                                self.siteFiles = [...self.siteFiles];
                            }
                        })
                        // success
                        this.dialog.open(ConfirmComponent, {
                            data: {
                            title: "",
                            titleIcon: "close",
                            message: "Successfully removed Sensor",
                            confirmButtonText: "OK",
                            showCancelButton: false,
                            },
                        });
                    }else{
                        // error
                        this.dialog.open(ConfirmComponent, {
                            data: {
                            title: "Error",
                            titleIcon: "close",
                            message: "Error removing Sensor",
                            confirmButtonText: "OK",
                            showCancelButton: false,
                            },
                        });
                    }
                })
            }
        });
    }

    /* istanbul ignore next */
    openPeaksDetailsDialog(row): void {
        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '100%';
        }
        else {
            dialogWidth = '40%';
        }
        this.dialog.open(PeakDialogComponent, {
            data: {
                peak: row,
                sensors: this.sensorDataSource.data,
                hwms: this.hwmDataSource.data,
                sensorFiles: this.sensorFilesDataSource.data,
            },
        });
    }

    /* istanbul ignore next */
    openPeaksEditDialog(row): void {
        let self = this;
        let hwms = this.hwmDataSource.data;
        let sensors = this.sensorDataSource.data;
        
        const dialogRef = this.dialog.open(PeakEditComponent, {
            data: {
                peak: row,
                site_id: this.site.site_id,
                siteHWMs: hwms,
                siteSensors: sensors,
                sensorFiles: this.sensorFilesDataSource.data,
                hwmFiles: this.hwmFilesDataSource.data,
                event_id: this.currentEvent,
                event: this.event,
            },
            width: '100%',
            autoFocus: false
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result.data && result.data.peak !== undefined && result.data.peak !== null){
                if(result.editOrCreate === "Edit"){
                    // Update peak
                    this.peaksDataSource.data.forEach(function(peak, i){
                        if (peak.peak_summary_id === result.data.peak.peak_summary_id){
                            result.data.peak.event_name = self.peaksDataSource.data[i].event_name;
                            result.data.peak.format_peak_date = self.setTimeAndDate(result.data.peak.peak_date);
                            self.peaksDataSource.data[i] = result.data.peak;
                            self.peaksDataSource.data = [...self.peaksDataSource.data];
                        }
                    })
                    // Update HWMs
                    if(result.data.hwmsToAdd.length > 0){
                        let hwmsToAdd = result.data.hwmsToAdd.join(',');
                        this.hwmDataSource.data.forEach(function(hwm, h) {
                            if (hwmsToAdd.includes(String(hwm.hwm_id))){
                                self.hwmDataSource.data[h].peak_summary_id = result.data.peak.peak_summary_id;
                            }
                        })
                    }
                    if(result.data.hwmsToRemove.length > 0){
                        let hwmsToRemove = result.data.hwmsToRemove.join(',');
                        this.hwmDataSource.data.forEach(function(hwm, h) {
                            if (hwmsToRemove.includes(String(hwm.hwm_id))){
                                self.hwmDataSource.data[h].peak_summary_id = null;
                            }
                        })
                    }
                }else if(result.editOrCreate === "Create"){
                    // Add peak
                    result.data.peak.event_name = self.event;
                    result.data.peak.format_peak_date = self.setTimeAndDate(result.data.peak.peak_date);
                    self.peaksDataSource.data.push(result.data.peak);
                    self.peaksDataSource.data = [...self.peaksDataSource.data];
                    
                    // Update HWMs
                    if(result.data.hwmsToAdd.length > 0){
                        let hwmsToAdd = result.data.hwmsToAdd.join(',');
                        this.hwmDataSource.data.forEach(function(hwm, h) {
                            if (hwmsToAdd.includes(String(hwm.hwm_id))){
                                self.hwmDataSource.data[h].peak_summary_id = result.data.peak.peak_summary_id;
                            }
                        })
                    }
                }
            }
        });
    }

    openFileDetailsDialog(row, type): void {
        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '100%';
        }
        else {
            dialogWidth = '40%';
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

    openFileEditDialog(row, type): void {
        let self = this;
        const dialogRef = this.dialog.open(FileEditComponent, {
            data: {
                row_data: row,
                type: type,
                siteInfo: this.site,
                addOrEdit: 'Edit'
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if(result){
                if(type === "Site File") {
                    // Update files data source and site
                    self.siteFilesDataSource.data.forEach(function(file, i){
                        if(file.file_id === result.file_id){
                            self.siteFilesDataSource.data[i] = result;
                            self.siteFilesDataSource.data = [...self.siteFilesDataSource.data];
                        }
                    })
                }else if(type === "HWM File") {
                    // Update files data source and hwm
                    self.hwmFilesDataSource.data.forEach(function(file, i){
                        if(file.file_id === result.file_id){
                            self.hwmFilesDataSource.data[i] = result;
                            self.hwmFilesDataSource.data = [...self.hwmFilesDataSource.data];
                        }
                    })
                }else if(type === "Reference Datum File") {
                    // Update files data source and reference datum
                    self.refMarkFilesDataSource.data.forEach(function(file, i){
                        if(file.file_id === result.file_id){
                            self.refMarkFilesDataSource.data[i] = result;
                            self.refMarkFilesDataSource.data = [...self.refMarkFilesDataSource.data];
                        }
                    })
                }else if(type === "Sensor File") {
                    // Update files data source and sensor
                    self.sensorFilesDataSource.data.forEach(function(file, i){
                        if(file.file_id === result.file_id){
                            self.sensorFilesDataSource.data[i] = result;
                            self.sensorFilesDataSource.data = [...self.sensorFilesDataSource.data];
                        }
                    })
                }
            }
        });
    }

    addFile(type, event): void {
        let self = this;
        // Prevent expansion panel from toggling
        event.stopPropagation();

        // Open File Edit Dialog
        const dialogRef = this.dialog.open(FileEditComponent, {
            data: {
                row_data: null,
                type: type,
                siteInfo: this.site,
                siteRefDatums: this.refMarkDataSource.data,
                siteHWMs: this.hwmDataSource.data,
                siteSensors: this.sensorDataSource.data,
                addOrEdit: 'Add'
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if(result){
                if(type === "Site File") {
                    // Update files data source and site
                    self.siteFilesDataSource.data.push(result);
                    self.siteFilesDataSource.data = [...self.siteFilesDataSource.data];
                }else if(type === "HWM File") {
                    // Update files data source and hwm
                    self.hwmFilesDataSource.data.push(result);
                    self.hwmFilesDataSource.data = [...self.hwmFilesDataSource.data];
                }else if(type === "Reference Datum File") {
                    // Add rd name to result
                    self.refMarkDataSource.data.forEach(function(rd){
                        if(rd.objective_point_id === result.objective_point_id){
                            result.rd_name = rd.name;
                        }
                    })
                    // Update files data source and reference datum
                    self.refMarkFilesDataSource.data.push(result);
                    self.refMarkFilesDataSource.data = [...self.refMarkFilesDataSource.data];
                }else if(type === "Sensor File") {
                    // Update files data source and sensor
                    self.sensorFilesDataSource.data.push(result);
                    self.sensorFilesDataSource.data = [...self.sensorFilesDataSource.data];
                }
            }
        });
    }

    deleteFile(row, type): void {
        let self = this;

        const dialogRef = this.dialog.open(ConfirmComponent, {
            data: {
              title: "Remove File",
              titleIcon: "close",
              message: "Are you sure you want to remove this file?",
              confirmButtonText: "OK",
              showCancelButton: true,
            },
          });
        dialogRef.afterClosed().subscribe((result) => {
            if(result) {
                // Delete file
                this.fileEditService.deleteFile(row.file_id).subscribe((results) => {
                    if(results === null){
                        // success
                        this.dialog.open(ConfirmComponent, {
                            data: {
                            title: "",
                            titleIcon: "close",
                            message: "Successfully removed file",
                            confirmButtonText: "OK",
                            showCancelButton: false,
                            },
                        });
                        if(type === "Site File") {
                            // Update files data source and site
                            self.siteFilesDataSource.data.forEach(function(file, i){
                                if(file.file_id === row.file_id){
                                    self.siteFilesDataSource.data.splice(i, 1);
                                    self.siteFilesDataSource.data = [...self.siteFilesDataSource.data];
                                }
                            })

                        }else if(type === "HWM File") {
                            // Update files data source and hwm
                            self.hwmFilesDataSource.data.forEach(function(file, i){
                                if(file.file_id === row.file_id){
                                    self.hwmFilesDataSource.data.splice(i, 1);
                                    self.hwmFilesDataSource.data = [...self.hwmFilesDataSource.data];
                                }
                            })
                        }else if(type === "Reference Datum File") {
                            // Update files data source and reference datum
                            self.refMarkFilesDataSource.data.forEach(function(file, i){
                                if(file.file_id === row.file_id){
                                    self.refMarkFilesDataSource.data.splice(i, 1);
                                    self.refMarkFilesDataSource.data = [...self.refMarkFilesDataSource.data];
                                }
                            })
                        }else if(type === "Sensor File") {
                            // Update files data source and sensor
                            self.sensorFilesDataSource.data.forEach(function(file, i){
                                if(file.file_id === row.file_id){
                                    self.sensorFilesDataSource.data.splice(i, 1);
                                    self.sensorFilesDataSource.data = [...self.sensorFilesDataSource.data];
                                }
                            })
                        }
                    }else{
                        // error
                        this.dialog.open(ConfirmComponent, {
                            data: {
                            title: "Error",
                            titleIcon: "close",
                            message: "Error removing file",
                            confirmButtonText: "OK",
                            showCancelButton: false,
                            },
                        });
                    }
                })
            }
        });
    }

    openEditDialog(){
        let siteHousing = JSON.parse(JSON.stringify(this.siteHousing));

        if(this.role === '3' || this.role === '2' || this.role === '1'){
            const dialogRef = this.dialog.open(SiteEditComponent, {
                data: {
                    site: this.site,
                    networkType: this.networkType,
                    networkName: this.networkName,
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
            dialogRef.afterClosed().subscribe((result) => {
                if(result){
                    if(result.site !== null){
                        // Update site details page with any edits
                        let siteResultCopy = JSON.parse(JSON.stringify(result.site));
                        let currentSiteCopy = JSON.parse(JSON.stringify(this.site));
                        delete siteResultCopy.last_updated; delete siteResultCopy.last_updated_by; delete currentSiteCopy.last_updated; delete currentSiteCopy.last_updated_by;
                        // copy and remove last updated info to compare
                        // Site info changed
                        if(siteResultCopy !== currentSiteCopy){
                            this.site = result.site;
                        }
                    }
                    
                    if(result.housings.length > 0){
                        // Update housing
                        let housingResultCopy = JSON.parse(JSON.stringify(result.housings));
                        let currentHousingCopy = JSON.parse(JSON.stringify(this.siteHousing));
                        delete housingResultCopy.last_updated; delete housingResultCopy.last_updated_by; delete currentHousingCopy.last_updated; delete currentHousingCopy.last_updated_by;
                        if(currentHousingCopy !== housingResultCopy){                     
                            this.siteHousing = result.housings;
                        }
                    }

                    if(result.networkType.length > 0){
                        // Update network types
                        // let netTypeResultCopy = JSON.parse(JSON.stringify(result.networkType));
                        // let currentNetTypeCopy = JSON.parse(JSON.stringify(this.networkType));
                        // console.log(netTypeResultCopy, currentNetTypeCopy)
                        // delete netTypeResultCopy.last_updated; delete netTypeResultCopy.last_updated_by; delete currentNetTypeCopy.last_updated; delete currentNetTypeCopy.last_updated_by;
                        if(result.networkType.join(',') !== this.networkType){
                            console.log("network types changed")
                            this.networkType = result.networkType.join(', ');
                        }
                    }else{
                        this.networkType = '';
                    }

                    if(result.networkName.length > 0){
                        if(result.networkName.join(',') !== this.networkName){
                            this.networkName = result.networkName.join(', ');
                        }
                    }else{
                        this.networkName = '';
                    }

                    // Files
                    if(result.files.length > 0){
                        this.siteFilesDataSource.data = result.files;
                        this.fileLength = this.siteFilesDataSource.data.length + this.hwmFilesDataSource.data.length + this.refMarkFilesDataSource.data.length + this.sensorFilesDataSource.data.length;
                    }

                    // Landowner
                    if(result.landowner !== null){
                        this.landownerContact = result.landowner;
                    }
                }
            });
        }

    }
    
    // fired when user clicks a sortable header
    sortSensorData(sort: Sort) {
        const data = this.sensorDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedSensorData = data;
            return;
        }
        this.sortedSensorData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'serial_number':
                    return this.compare(a.serial_number, b.serial_number, isAsc);
                case 'eventName':
                    return this.compare(a.eventName, b.eventName, isAsc);
                case 'deploymentType':
                    return this.compare(a.deploymentType, b.deploymentType, isAsc);
                case 'sensorType':
                    return this.compare(a.sensorType, b.sensorType, isAsc);
                case 'statusType':
                    return this.compare(a.statusType, b.statusType, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.sensorDataSource.data = this.sortedSensorData;
    }

    // fired when user clicks a sortable header
    sortHWMData(sort: Sort) {
        const data = this.hwmDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedHWMData = data;
            return;
        }
        this.sortedHWMData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'hwm_id':
                    return this.compare(a.hwm_id, b.hwm_id, isAsc);
                case 'hwm_label':
                    return this.compare(a.hwm_label, b.hwm_label, isAsc);
                case 'flag_date':
                    let aDate = this.checkDate(a.flag_date);
                    let bDate = this.checkDate(b.flag_date);
                    return this.compare(aDate, bDate, isAsc);
                case 'elev_ft':
                    return this.compare(a.elev_ft, b.elev_ft, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.hwmDataSource.data = this.sortedHWMData;
    }

     // fired when user clicks a sortable header
     sortPeaksData(sort: Sort) {
        const data = this.peaksDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedPeaksData = data;
            return;
        }
        this.sortedPeaksData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'peak_stage':
                    return this.compare(a.peak_stage, b.peak_stage, isAsc);
                case 'event_name':
                    return this.compare(a.event_name, b.event_name, isAsc);
                case 'peak_date':
                    let aDate = this.checkDate(a.peak_date);
                    let bDate = this.checkDate(b.peak_date);
                    return this.compare(aDate, bDate, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.peaksDataSource.data = this.sortedPeaksData;
    }

    sortRefMarkData(sort: Sort) {
        const data = this.refMarkDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedRefMarkData = data;
            return;
        }
        /* istanbul ignore next */
        this.sortedRefMarkData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this.compare(a.name, b.name, isAsc);
                case 'elev_ft':
                    return this.compare(a.elev_ft, b.elev_ft, isAsc);
                case 'description':
                    return this.compare(a.description, b.description, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.refMarkDataSource.data = this.sortedRefMarkData;
    }

    sortRefMarkFilesData(sort: Sort) {
        const data = this.refMarkFilesDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedRefMarkFilesData = data;
            return;
        }
        /* istanbul ignore next */
        this.sortedRefMarkFilesData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this.compare(a.name, b.name, isAsc);
                case 'file_date':
                    let aDate = this.checkDate(a.file_date);
                    let bDate = this.checkDate(b.file_date);
                    return this.compare(aDate, bDate, isAsc);
                case 'rd_name':
                    return this.compare(a.rd_name, b.rd_name, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.refMarkFilesDataSource.data = this.sortedRefMarkFilesData;
    }

    sortSiteFilesData(sort: Sort) {
        const data = this.siteFilesDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedSiteFilesData = data;
            return;
        }
        /* istanbul ignore next */
        this.sortedSiteFilesData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this.compare(a.name, b.name, isAsc);
                case 'file_date':
                    let aDate = this.checkDate(a.file_date);
                    let bDate = this.checkDate(b.file_date);
                    return this.compare(aDate, bDate, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.siteFilesDataSource.data = this.sortedSiteFilesData;
    }

    sortSensorFilesData(sort: Sort) {
        const data = this.sensorFilesDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedSensorFilesData = data;
            return;
        }
        /* istanbul ignore next */
        this.sortedSensorFilesData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this.compare(a.name, b.name, isAsc);
                case 'file_date':
                    let aDate = this.checkDate(a.file_date);
                    let bDate = this.checkDate(b.file_date);
                    return this.compare(aDate, bDate, isAsc);
                case 'serial_number':
                    return this.compare(a.details.serial_number, b.details.serial_number, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.sensorFilesDataSource.data = this.sortedSensorFilesData;
    }

    sortHWMFilesData(sort: Sort) {
        const data = this.hwmFilesDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.sortedHWMFilesData = data;
            return;
        }
        /* istanbul ignore next */
        this.sortedHWMFilesData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this.compare(a.name, b.name, isAsc);
                case 'file_date':
                    let aDate = this.checkDate(a.file_date);
                    let bDate = this.checkDate(b.file_date);
                    return this.compare(aDate, bDate, isAsc);
                default:
                    return 0;
            }
        });

        // Need to update the data source to update the table rows
        this.hwmFilesDataSource.data = this.sortedHWMFilesData;
    }
    
    compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    checkDate(date) {
        return new Date(date);
    }
}
