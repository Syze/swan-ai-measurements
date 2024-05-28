var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import { APP_AUTH_BASE_URL, PROD_URL, STAGING_URL, requiredMetaData } from "./constants.js";
export function fetchData(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { path, body, queryParams, baseUrl = APP_AUTH_BASE_URL, apiKey = "", throwError = false, headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" }, stagingUrl = false, } = options;
        const apiUrl = `${getUrl({ urlName: baseUrl, stagingUrl: stagingUrl })}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
        try {
            const res = yield axios.post(apiUrl, body, { headers });
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
                throw new Error(`Failed to upload: ${(error === null || error === void 0 ? void 0 : error.message) || "something went wrong"}`);
            }
            return {};
        }
    });
}
export function checkParameters(...args) {
    for (const element of args) {
        if (!element) {
            return false;
        }
    }
    return true;
}
export function checkMetaDataValue(arr) {
    for (const key of requiredMetaData) {
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
export const addScanType = (arr, scan_id) => {
    for (const obj of arr) {
        if (!obj.scan_type) {
            arr.push({ scan_type: "clothing_custom_scan" });
        }
    }
    arr.push({ scan_id });
    return arr;
};
export function getFileChunks(file, chunkSize = 5 * 1024 * 1024) {
    const totalSize = file.size;
    const chunks = [];
    let start = 0;
    while (start < totalSize) {
        chunks.push(file.slice(start, start + chunkSize));
        start += chunkSize;
    }
    return chunks;
}
export const getUrl = ({ urlName, stagingUrl = false }) => {
    if (stagingUrl) {
        return STAGING_URL[urlName];
    }
    return PROD_URL[urlName];
};
