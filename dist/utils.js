"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMetaDataValue = exports.checkParameters = exports.fetchData = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
async function fetchData(options) {
    const { path, body, queryParams, baseUrl = constants_1.APP_AUTH_BASE_URL, apiKey = "", headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" }, } = options;
    const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
    try {
        const res = await axios_1.default.post(apiUrl, body, { headers });
        if (res.status >= 200 && res.status < 300) {
            return res.data;
        }
        console.error(`Error: Unexpected response status ${res.status}`);
        return {};
    }
    catch (error) {
        console.error(error, "while uploading");
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
    for (const key of constants_1.requiredMetaData) {
        let hasRequiredKey = false;
        for (const obj of arr) {
            if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null && obj[key] !== "" && typeof obj[key] !== "number") {
                hasRequiredKey = true;
                break;
            }
        }
        if (!hasRequiredKey) {
            return false;
        }
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
