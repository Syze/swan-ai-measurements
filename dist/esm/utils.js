var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { APP_AUTH_BASE_URL, requiredMetaData } from "./constants.js";
export function fetchData(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { path, body, queryParams, baseUrl = APP_AUTH_BASE_URL, apiKey = "", headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" }, } = options;
        console.log(body, "body", path, "path");
        const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
        try {
            const response = yield fetch(apiUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`Error: Unexpected response status ${response.status}`);
            }
            const data = yield response.json();
            return data;
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
