# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/USGS-WiM/stnweb2/tree/dev)

### Added

 -   
 
### Changed

 -  
 
 ### Fixed
 
 -   

## [v0.8.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.8.0) - 2022-06-05

### Added

 -  Ability to create HWMs
 -  Dropdown functionality to state and event filters on map page
 -  Added ability to delete HWMs
 -  Ability to create Reference Datums
 -  Added ability to delete reference datums
 -  Added ability to deploy a sensor
 -  Added ability to delete sensors
 -  Alert for deploying and retrieving sensors when no event selected
 -  Added ability to create a peak
 -  Added tooltips to all add button icons
 -  Added ability to delete a peak
 -  Added Description and Is Destroyed columns in reference datum table
 
### Changed

 -  Clear filters button styling to link
 -  Increased details modal widths
 -  Improved responsiveness of tables in details modals
 -  Autopopulate source and agency when adding file in site edit form
 -  Disabled add button when no event selected for Peaks, Sensors, HWMs and files (except site files)
 -  Disabled peak edit when no event selected
 -  Date Recovered to Date Last Checked in reference datum detail and edit modals
 
 ### Fixed
 
 -  Time reset in sensor edit modal when Cancel Edits is clicked
 -  Time validation in sensor edit
 -  Inability to login after logging out
 -  Duplicated disabled buttons when incorrect role and no event selected

## [v0.7.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.7.0) - 2022-01-17

### Added

-   Edit ability for Peaks
-   View details for Peaks
-   Adds view sensor button to results table which opens dialog listing sensors; includes button to site page
-   Makes siteid a link to site page
-   Event populated in map filter form on page load
-   Map filters after navigating from map page
-   Session event displayed on each page
-   Back to Map button displayed on each page
-   Add ability to add, edit and delete Site, Reference Datum and HWM files in Files Tab
-   Add View Results button on map
-   Phone, email and zip code format/validation in site edit form

### Changed

-   Sort result details table by sensor status when opened (Deployed > Retrieved > Proposed > Lost)
-   Revised peak table columns
-   Replaced alerts/confirms with dialog
-   Updated Reference Datum Edit dialog layout
-   Updated radio button/form field layout for all edit dialogs
-   View Details and Edit buttons move within button menu on smaller screens
-   Implement consistent button styling throughout app
-   Remove second navbar
-   Restyle event filters on map page
-   Remove minimize/maximize map button
-   Change placeholders in map filters to All __

### Fixed

-  Sensor files not displaying when event selected
-  Sensor and HWM files not always displaying in peak dialogs when event selected
-  Sensor markers not displaying on map when no deployment type
-  View Details/Edit buttons displayed in both column and menu
-  Site icon not displayed on map on site pages when no sensors or hwms
-  Surveyed RP Only Sites not send with map filter query
-  Markers not showing up after returning to map page

## [v0.6.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.6.0) - 2022-01-25

### Added

-   Added map filter button on mobile.  Map filters open to replace the map and filter results.
-   Added Real-Time Stream Gage layer
-   Added Site Page with navigation from site popups on map
-   Added map to site details page
-   Added pagination and sorting to tables on site dashboard page
-   USWDS banner and accessability styles
-   Map to site page
-   Added sorting and pagination to tables on site page
-   Edit ability for site page
-   Edit ability for Reference Datums
-   Edit ability for HWMs
-   Edit ability for Sensors
-   Edit ability for Sensors
-   User management page
-   ability to add new user
-   View details, edit, and delete button for site entities

### Changed

-   Map filters placed in sidebar component
-   Clear Filters and Filter Sites buttons moved back from filter to map component
-   Table styling for results and result modal
-   If no location description for sensors in table, display N/A
-   Disallowed closing of the login dialog
-   Redirecting to landing page on logout
-   Multiple panels may be open and do not reset on filtering the map
-   Minimize legend and map button in mobile view
-   Display n/a for empty location descriptions
-   Change "Datum Location" to "Reference Datum"
-   Forced login to access/view application
-   Keep filter section expanded if filter is selected
-   Removed tape downs from sensor table
-   Disabled clicking outside of the add new user dialog

### Fixed

-   Width of map container on mobile fits to screen size
-   Event list is reset when "Clear Filters" is clicked and active styling for previously selected event types removed
-   Fixed map filter overlap with results panel and footer
-   Minimized button moved above map on mobile screen sizes
-   Results and result modal mobile responsiveness
-   Bug in consistently populating results table
-   Streamgage markers removed from map when Clear Filters button is clicked
-   Fixed site ID not added to popups for some sites
-   Use last updated date if no event end date for NOAA and streamgage popups
-   Event filters not clearing on button click
-   Mobile and layout fixes
-   Remove real-time streamgage layer on clear filters click
-   SiteID not populating on map filter change
-   Peak not showing when event is selected
-   Role and Agency not sorting in user management table

## [v0.5.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.5.0) - 2021-06-10

### Added

-   NOAA Tides and Current Stations layer to map, layer control, and legend

### Changed

-   Switched to marker clusters for large queries
-   Results panel opens when filter is submitted
-   Site markers clear when click "Clear Filters"

### Fixed

-   Fixed measure tools
-   State filter works
-   Open Street Maps checked on when map loads
-   Filter query returns no results when the only sites matching query are invalid

## [v0.4.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.4.0) - 2020-01-12

### Added

-   Added sites layer to layer control and legend
-   Added Results table for sites on map with sorting and pagination
-   Added all STN sites layer
-   Added EventType and EventState Filters to filter the Events choice list
-   Added site filter options for: HWMs Surveyed, HWM Only, Sensor Only, Surveyed RP Only, Pre-Deployed Bracket, RDG Only, Has OP Defined
-   Added popup on site click with site information
-   Added warning message when user's query returns no data
-   Added Login capability
-   Added requirement for user to select at least one of Event, State, Network, or Sensor filter
-   Added ability to deselect survey filter

### Changed

-   Extent button now zooms to site markers
-   Map zooms to sites when filters are submitted
-   State filters are searchable
-   Removed extra navbar buttons, changed style of Map button
-   Skips out of place sites
-   Changed popup and table formatting

### Fixed

-   Fixed event filter auto-update
-   Fixed networks filter
-   Fixed layer control

## [v0.3.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.3.0) - 2020-12-08

### Added

-   Added prerequisite for at least one layer to be checked before the legend appears
-   Added popup message for when a layer is removed due to user zooming out
-   Added min zoom warning in layer control
-   Added placeholder buttons for submitting and clearing filters

### Changed

-   Adjusted color of second navbar
-   Changed "HWMS Surveyed" from checkbox to radio buttons

## [v0.2.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.2.0) - 2020-11-24

### Added

-   Added esri-leaflet geosearch
-   Added measure tools
-   Added layout to map filters
-   Added state, sensor type, and network name services and filter selections
-   Added supplementary layers to toggle
-   Added legend
-   Added Watershed layer to legend
-   Added Watches/warnings and current warnings to map and legend
-   Added AHPS gages to map and legend

## [v0.1.0](https://github.com/USGS-WiM/stnweb2/releases/tag/v0.1.0) - 2020-11-10

### Added

-   Added home button for resetting map extent
-   Added event Selector with autocomplete and sorted by date
-   Added map filter section
-   Added dialog for map filtering
-   Changelog added (CHANGELOG.md)
-   Added github super-linter
-   Added interfaces
-   Added esri-leaflet geosearch
-   Added measure tools
-   Added sites service to get sites by event
-   Added additional navbar row

### Changed

-   Removed sidebar
-   Made Open Street Maps the default

### Fixed
