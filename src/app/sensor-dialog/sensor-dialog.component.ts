import { Component, OnInit, ViewChild } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SiteService } from '@app/services/site.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-sensor-dialog',
  templateUrl: './sensor-dialog.component.html',
  styleUrls: ['./sensor-dialog.component.scss']
})
export class SensorDialogComponent implements OnInit {
  @ViewChild('sensorFilesPaginator') sensorFilesPaginator: MatPaginator;
  @ViewChild('nwisFilesPaginator') nwisFilesPaginator: MatPaginator;
  
  public sensorFiles = [];
  public nwisFiles = [];
  public members = [];
  public deployedSensors = 0;
  public lostSensors = 0;
  public retrievedSensors = 0;
  public eventName;
  public deployedTapedowns = [];
  public retrievedTapedowns = [];
  public lostTapedowns = [];
  public deployedExpanded = false;
  public retrievedExpanded = false;
  public lostExpanded = false;

  nwisFilesDataSource;
  sensorFilesDataSource;

  displayedSensorFileColumns: string[] = [
    'FileDate',
    'FileName',
  ];

  displayedNWISFileColumns: string[] = [
    'FileDate',
    'FileName',
  ];

  displayedTapedownColumns: string[] = [
    'ReferenceMark',
    'Elevation',
    'OffsetCorrection',
    'WaterSurface',
    'GroundSurface',
  ];

  constructor(
    private dialogRef: MatDialogRef<SensorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public siteService: SiteService,
  ) { }

  ngOnInit(): void {
    if(this.data.row_data !== undefined){
      if(this.data.row_data.statusType === "Deployed"){
        this.deployedExpanded = true;
      }else if (this.data.row_data.statusType === "Retrieved"){
        this.retrievedExpanded = true;
      }else if (this.data.row_data.statusType === "Lost"){
        this.lostExpanded = true;
      }
      
      this.getSensorFiles();
      this.setMembers();
      this.setElevations();

      let self = this;
      // Check sensor statuses
      this.data.row_data.instrument_status.forEach(function(instrument){
        if(instrument.status === "Deployed"){
          self.deployedSensors ++;
        }
        else if(instrument.status === "Retrieved"){
          self.retrievedSensors ++;
        }
        else if(instrument.status === "Lost"){
          self.lostSensors ++;
        }
      });
    }

  }

  getSensorFiles(){
    let self = this;

    this.siteService
    .getSensorFiles(this.data.row_data.instrument_id)
    .subscribe((results) => {
      if(results.length > 0){
        results.forEach(function(result){
          if(result.is_nwis !== undefined && result.is_nwis === 1){
            self.nwisFiles.push(result);
          }else{
            self.sensorFiles.push(result);
          }
        })
      }
      this.nwisFilesDataSource = new MatTableDataSource(this.nwisFiles);
      this.nwisFilesDataSource.paginator = this.nwisFilesPaginator;

      this.sensorFilesDataSource = new MatTableDataSource(this.sensorFiles);
      this.sensorFilesDataSource.paginator = this.sensorFilesPaginator;
    });
  }

  setMembers() {
    let self = this;

    this.data.row_data.instrument_status.forEach(function(instrument){
      self.siteService
      .getMemberName(instrument.member_id)
      .subscribe((results) => {
        self.members.push({name: results.fname + " " + results.lname, status: instrument.status});
      })
    })
  }

  setElevations(){
    let self = this;

    function getTapedowns(tapedownArray, instrument){
      if(instrument.vdatum !== undefined && instrument.vdatum !== ''){
        tapedownArray.push({elevation: instrument.vdatum});
      }
        self.siteService
        .getOPMeasurements(instrument.instrument_status_id)
        .subscribe((results) => {
          if(results.length > 0){
            if (tapedownArray[0] !== undefined){
              tapedownArray[0].ground_surface = results[0].ground_surface;
            }else{
              tapedownArray.push({ground_surface: results[0].ground_surface});
            }
            tapedownArray[0].water_surface = results[0].water_surface;
            tapedownArray[0].offset_correction = results[0].offset_correction;
            // get reference mark info using objective_point_id
            self.siteService
            .getOPInfo(results[0].objective_point_id)
            .subscribe((objectivePoints) => {
              tapedownArray[0].rmName = objectivePoints.name;
              if(objectivePoints.elev_ft !== undefined){
                tapedownArray[0].elevation = objectivePoints.elev_ft + " " + instrument.vdatum;
              }
            })
          }
        });
    }

    this.data.row_data.instrument_status.forEach(function(instrument){
      if(instrument.status === 'Deployed'){
        getTapedowns(self.deployedTapedowns, instrument);
      }
      else if (instrument.status === 'Retrieved'){
        getTapedowns(self.retrievedTapedowns, instrument);
      }
      else if (instrument.status === 'Lost'){
        getTapedowns(self.lostTapedowns, instrument);
      }
    })
  }

}
