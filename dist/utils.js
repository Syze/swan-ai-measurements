"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileChunks = exports.checkMetaDataValue = exports.checkParameters = exports.fetchData = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
async function fetchData(options) {
    const { path, body, queryParams, baseUrl = constants_js_1.APP_AUTH_BASE_URL, apiKey = "", throwError = false, headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" }, } = options;
    const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
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
            throw new Error(`Failed to upload: ${error.message}`);
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
