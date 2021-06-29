# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/USGS-WiM/stnweb2/tree/dev)

### Added

-   Added map filter button on mobile.  Map filters open to replace the map and filter results.

### Changed

-   Map filters placed in sidebar component

### Fixed

-   Width of map container on mobile fits to screen size
-   Event list is reset when "Clear Filters" is clicked and active styling for previously selected event types removed

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
