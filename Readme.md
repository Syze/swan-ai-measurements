## SWAN Node.js Library

Swan is an AI Fitting Room that lets shoppers size & try on clothes virtually. For clothing brands and online retailers, Swan powers completely personalised sales – increasing conversion & reducing expensive returns.

## Documentation

See the <a href="https://www.swanvision.ai/docs">SWAN API docs</a> for Node.js.

## Requirements

Node 20 or higher.

## Usage

##### Installation

    npm i @swan-admin/swan-ai-measurements

##### Create Customer

    swan.custom.createCustomer({name, store_url, location, email, emailsTier_1, emailsTier_2})

##### Upload file

    swan.fileUpload.uploadFile({ file, objMetaData, scanId })

##### Get measurements

     swan.measurement.getMeasurementResult(scanId)

## Support

New features and bug fixes are released on the latest major version of the SWAN package. If you are on an older major version, we recommend that you upgrade to the latest in order to use the new features and bug fixes including those for security vulnerabilities. Older major versions of the package will continue to be available for use, but will not be receiving any updates.
