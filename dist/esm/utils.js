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
import { APP_AUTH_BASE_URL, requiredMetaData } from "./constants.js";
export function fetchData(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { path, body, queryParams, baseUrl = APP_AUTH_BASE_URL, apiKey = "", headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" }, timeout = 5000, // Default timeout value in milliseconds (adjust as needed)
         } = options;
        console.log(body, "body", path, "path");
        const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
        try {
            const res = yield axios.post(apiUrl, body, { headers, timeout });
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
