# lea.online App

[![Build Android APK](https://github.com/leaonline/leaonline-app/actions/workflows/build_android_apk.yml/badge.svg)](https://github.com/leaonline/leaonline-app/actions/workflows/build_android_apk.yml)
[![Test suite](https://github.com/leaonline/leaonline-app/actions/workflows/jest_test.yml/badge.svg)](https://github.com/leaonline/leaonline-app/actions/workflows/jest_test.yml)
[![Lint Test](https://github.com/leaonline/leaonline-app/actions/workflows/lint_test.yml/badge.svg)](https://github.com/leaonline/leaonline-app/actions/workflows/lint_test.yml)
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)
![GitHub](https://img.shields.io/github/license/leaonline/leaonline-app)

## About

The lea.online app is a mobile app, developed using React-Native and Meteor.


## Install the app

TBD, we will link the app store / play store links here, once we have a release


## Install for development

We provide you an installation script, which you should run from your terminal:

```bash
$ ./scripts/install.sh
```

Do not run the script with `sudo` and do not cd into the `scripts` directory. 

The script will ask you several questions to optimize your installation, if you
however wish to do a full manual installation, please visit the 
[manual installation](./docs/manual_install.md) guide.


## Development

If you wish to participate in development, please make sure you have read our
contribution guidelines.

### Run the tests

We use jest (as default, defined by expo) to run the app tests and mocha to run
the backend tests.

To tun the tests on the backend, please execute the `test.sh` script in the 
`backend` project folder.

To run the tests for the app, please execute `npm run test` in the app's `src`
folder.

### Documentation

We use jsDoc for api documentation of the app, as well as of the backend.
In each projects you can simply run

```bash
$ npm run docs
```

The docs are generated in the output folder `docs`.
