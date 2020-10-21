# Short Term Network Web (STNWeb) v2

[![GitHub Super-Linter](https://github.com/USGS-WiM/stnweb2/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)

![WiM](wimlogo.png)

2nd generation of STNWeb, the data entry and data management web application for the USGS Short Term Network high-water mark and storm tide sensor database.

## Prerequisites

[Node](https://nodejs.org/en/),[NPM](https://www.npmjs.com/), [Angular CLI](https://cli.angular.io/)

```bash
npm install -g @angular/cli
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Clone the repo and `cd` to that directory

install dependencies:

```bash
npm install
```

### Development

Serve application with live reload change detection:

```bash
ng serve
```

### Building and testing

to build a distribution folder for production:

```bash
ng build --prod --base-href "[relative path to web server root]"
```

### Deployment

TBD

## Built With

-   [Angular](https://angular.io/) - The main web framework used
-   [NPM](https://www.npmjs.com/) - Dependency Management

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests to us. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on adhering by the [USGS Code of Scientific Conduct](https://www2.usgs.gov/fsp/fsp_code_of_scientific_conduct.asp).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](../../tags).

## Changelog

All developers must maintain the Changelog located at root as CHANGELOG.md. This document serves as a portable history of changes to the codebase and is meant to complement Github release tags. 'Added', 'Changed', and 'Fixed' sections should be updated within the Unreleased header when creating a Pull Request. As releases are created, those sections will move down into respective release headers.

## Authors

Lauren Privette - _Lead Developer_ - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)

Blake Draper - _Developer_ - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)

See also the list of [contributors](../../graphs/contributors) who participated in this project.

## License

This project is licensed under the Creative Commons CC0 1.0 Universal License - see the [LICENSE.md](LICENSE.md) file for details

## Suggested Citation

In the spirit of open source, please cite any re-use of the source code stored in this repository. Below is the suggested citation:

`This project contains code produced by the Web Informatics and Mapping (WIM) team at the United States Geological Survey (USGS). As a work of the United States Government, this project is in the public domain within the United States. https://wim.usgs.gov`

## Acknowledgments

## About WIM

-   This project authored by the [USGS WIM team](https://wim.usgs.gov)
-   WIM is a team of developers and technologists who build and manage tools, software, web services, and databases to support USGS science and other federal government cooperators.
-   WIM is a part of the [Upper Midwest Water Science Center](https://www.usgs.gov/centers/wisconsin-water-science-center).
