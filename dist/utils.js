"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMetaDataValue = exports.checkParameters = exports.fetchData = void 0;
const constants_js_1 = require("./constants.js");
async function fetchData(options) {
    const { path, body, queryParams, baseUrl = constants_js_1.APP_AUTH_BASE_URL, apiKey = "", headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" }, } = options;
    console.log(body, "body", path, "path");
    const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`Error: Unexpected response status ${response.status}`);
        }
        const data = await response.json();
        return data;
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
    for (const key of constants_js_1.requiredMetaData) {
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
