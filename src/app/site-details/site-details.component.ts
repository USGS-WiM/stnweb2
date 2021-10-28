import { Component, OnInit } from '@angular/core';
import {
    Router,
    ActivatedRoute,
    ParamMap,
    NavigationEnd,
} from '@angular/router';
import { SiteService } from '@services/site.service';
import { DetailsDialogComponent } from '@app/details-dialog/details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
declare let L: any;
import 'leaflet';

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
    // private statusTypes;

    displayedColumns: string[] = [
        'HousingType',
        'HousingLength',
        'HousingMaterial',
        'Amount',
        'Notes',
    ];

    displayedSensorColumns: string[] = [
        'SerialNumber',
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
        public dialog: MatDialog,
    ) {}

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
                            if(results.length > 0){
                                this.networkType = results[0].network_type_name;
                            }

                        });

                    // Get network name
                    this.siteService
                        .getNetworkName(this.siteID)
                        .subscribe((results) => {
                            if(results.length > 0){
                                this.networkName = results[0].name
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

                    // If no event selected
                    if(this.currentEvent === 0){
                        // Get site full instruments
                        this.siteService
                        .getSiteFullInstruments(this.siteID)
                        .subscribe((results) => {
                                this.siteFullInstruments = results;
                                console.log(this.siteFullInstruments)
                                if(results.length > 0){
                                    this.siteFullInstruments.forEach(function(result){
                                        console.log(result)
                                        let timestamp = new Date(Math.max(...result.instrument_status.map(e => new Date(e.time_stamp))));
                                        
                                        result.instrument_status.forEach(function(statusType){
                                            let time = new Date(statusType.time_stamp);

                                            if (timestamp.getTime() === time.getTime()){
                                                result.statusType = statusType.status;
                                            }
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
                                // if (result.event_name === self.event){
                                    let peakDate = result.peak_date.split("T")[0];
                                    peakDate = peakDate.split("-");
                                    peakDate = peakDate[1] + "/" + peakDate[2] + "/" + peakDate[0];
                                    result.peak_date = peakDate;
                                    self.peaks.push(result);
                                // }
                            }) 
                        }

                    });

                    // Get landowner contact
                    if (this.site.landownercontact_id !== undefined){
                        this.siteService
                            .getLandownerContact(this.siteID)
                            .subscribe((results) => {
                                if(results.length > 0){
                                    this.landownerContact = results.fname;
                                }
                            });
                    }

                    // Get member name
                    if(this.site.member_id !== undefined){
                        this.siteService
                            .getMemberName(this.site.member_id)
                            .subscribe((results) => {
                                if(results.length > 0){
                                    this.memberName = results.fname + " " + results.lname;
                                }
                                
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
            zoom: 12,
            layers: [osm],
            renderer: L.canvas(),
        });
    }

    openDetailsDialog(row, type): void {
        let dialogWidth;
        if (window.matchMedia('(max-width: 768px)').matches) {
            dialogWidth = '80%';
        }
        else {
            dialogWidth = '30%';
        }
        const dialogRef = this.dialog.open(DetailsDialogComponent, {
            width: dialogWidth,
            data: {
                row_data: row,
                type: type
            },
        });
        dialogRef.afterClosed().subscribe((result) => {});
    }
}
