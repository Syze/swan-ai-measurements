"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = exports.getUrl = exports.getFileChunks = exports.addScanType = exports.checkValues = exports.checkMetaDataValue = exports.checkParameters = exports.fetchData = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const enum_js_1 = require("./enum.js");
async function fetchData(options) {
    const { path, body, queryParams, baseUrl = constants_js_1.APP_AUTH_BASE_URL, apiKey = "", throwError = false, headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" }, urlType = enum_js_1.URLType.PROD, } = options;
    const apiUrl = `${(0, exports.getUrl)({ urlName: baseUrl, urlType })}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
    try {
        const res = await axios_1.default.post(apiUrl, body, { headers });
        if (res.status >= 200 && res.status < 300) {
            return res.data;
        }
        console.error(`Error: Unexpected response status ${res.status}`);
        if (throwError) {
            throw new Error(`Failed to upload`);
        }
        return {};
    }
    catch (error) {
        console.error(error, "while uploading");
        if (throwError) {
            throw new Error(`Failed to upload: ${error?.message || "something went wrong"}`);
        }
        return {};
    }
}
exports.fetchData = fetchData;
function checkParameters(...args) {
    for (const element of args) {
        if (!element) {
            return false;
        }
    }
    return true;
}
exports.checkParameters = checkParameters;
function checkMetaDataValue(arr) {
    if (!(0, exports.checkValues)(arr, constants_js_1.requiredMetaData)) {
        return false;
    }
    let correctFormat = false;
    for (const obj of arr) {
        if (obj.callback_url && obj.callback_url.startsWith("https")) {
            correctFormat = true;
        }
    }
    if (!correctFormat) {
        return false;
    }
    return true;
}
exports.checkMetaDataValue = checkMetaDataValue;
const checkValues = (arr, requiredMetaData) => {
    for (const key of requiredMetaData) {
        let hasRequiredKey = false;
        for (const obj of arr) {
            if (Object.prototype.hasOwnProperty.call(obj, key) &&
                obj[key] !== undefined &&
                obj[key] !== null &&
                obj[key] !== "" &&
                typeof obj[key] !== "number") {
                hasRequiredKey = true;
                break;
            }
        }
        if (!hasRequiredKey) {
            return false;
        }
    }
    return true;
};
exports.checkValues = checkValues;
const addScanType = (arr, scan_id, email) => {
    const scanType = arr.find((el) => el.scan_type);
    if (!scanType) {
        arr.push({ scan_type: "clothing_scan" });
    }
    arr.push({ scan_id });
    arr.push({ email });
    return arr;
};
exports.addScanType = addScanType;
function getFileChunks(file, chunkSize = 5 * 1024 * 1024) {
    const totalSize = file.size;
    const chunks = [];
    let start = 0;
    while (start < totalSize) {
        chunks.push(file.slice(start, start + chunkSize));
        start += chunkSize;
    }
    return chunks;
}
exports.getFileChunks = getFileChunks;
const getUrl = ({ urlName, urlType = enum_js_1.URLType.STAGING }) => {
    return constants_js_1.URLS[urlType][urlName];
};
exports.getUrl = getUrl;
const isValidEmail = (email) => {
    const checkEmailValidation = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return checkEmailValidation.test(email);
};
exports.isValidEmail = isValidEmail;
