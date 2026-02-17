"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
const enum_js_1 = require("./enum.js");
class TryOn {
    #socketMap = new Map();
    #timerMap = new Map();
    #accessKey;
    #urlType;
    #token;
    constructor(accessKey, urlType = enum_js_1.URLType.PROD, token) {
        this.#accessKey = accessKey;
        this.#urlType = urlType;
        this.#token = token;
    }
    #getHeaders(token, extraHeaders = {}) {
        const requestToken = token ?? this.#token;
        return {
            ...extraHeaders,
            ...(this.#accessKey ? { "X-Api-Key": this.#accessKey } : {}),
            ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
        };
    }
    async uploadFile({ files, userEmail, fileNoLimit = 2 }) {
        if ((0, utils_js_1.checkParameters)(files, userEmail) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        if (fileNoLimit <= 0) {
            throw new Error(`Provide valid file number limit ${fileNoLimit}.`);
        }
        if (files?.length > fileNoLimit) {
            throw new Error(`Cannot allow more than ${fileNoLimit} files.`);
        }
        try {
            const payload = {
                userEmail,
                userImages: [],
            };
            files?.forEach((file) => {
                payload.userImages.push(file.name);
            });
            const signedUrlRes = await this.#getSignedUrl(payload);
            for (const file of files) {
                await this.#s3Upload(signedUrlRes.data.uploadUrls[file.name].url, file);
            }
            return `uploaded successfully!`;
        }
        catch (error) {
            throw error;
        }
    }
    #getSignedUrl(payload) {
        if ((0, utils_js_1.checkParameters)(payload) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
            headers: this.#getHeaders(undefined, { "Content-Type": "application/json" }),
        });
    }
    #s3Upload(url, file) {
        if ((0, utils_js_1.checkParameters)(url, file) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.put(url, file, {
            headers: {
                "Content-Type": file.type,
            },
        });
    }
    getUploadedFiles(userEmail) {
        if ((0, utils_js_1.checkParameters)(userEmail) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        const payload = {
            userEmail,
        };
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}`, payload, {
            headers: this.#getHeaders(),
        });
    }
    deleteImage({ userEmail, fileName }) {
        if ((0, utils_js_1.checkParameters)(userEmail, fileName) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        const payload = {
            userEmail,
            file: fileName,
        };
        return axios_1.default.delete(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_URLS}`, {
            headers: this.#getHeaders(),
            data: payload,
        });
    }
    #disconnectSocket = (tryonId) => {
        if (tryonId) {
            const socket = this.#socketMap.get(tryonId);
            const timer = this.#timerMap.get(tryonId);
            socket?.close();
            if (timer)
                clearTimeout(timer);
            this.#socketMap.delete(tryonId);
            this.#timerMap.delete(tryonId);
        }
        else {
            // Disconnect all
            this.#socketMap.forEach((socket) => socket.close());
            this.#timerMap.forEach((timer) => clearTimeout(timer));
            this.#socketMap.clear();
            this.#timerMap.clear();
        }
    };
    #handleTimeOut = ({ onSuccess, onError, tryonId }) => {
        const timer = setTimeout(() => {
            this.#handleGetTryOnResult({ onSuccess, onError, tryonId });
            this.#disconnectSocket(tryonId);
        }, 300000);
        this.#timerMap.set(tryonId, timer);
    };
    handleTryOnWebSocket = ({ tryonId, onError, onSuccess, onClose, onOpen }) => {
        if ((0, utils_js_1.checkParameters)(tryonId) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        this.#disconnectSocket(tryonId);
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_BASE_WEBSOCKET_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON}?tryonId=${tryonId}`;
        const socket = new WebSocket(url);
        this.#socketMap.set(tryonId, socket);
        socket.onopen = () => {
            onOpen?.();
            this.#handleTimeOut({ onSuccess, onError, tryonId });
        };
        socket.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            }
            catch (error) {
                console.log("Invalid JSON:", event.data);
                return;
            }
            if (data?.eventType === "tryon.completed") {
                onSuccess?.(data);
            }
            else if (data?.eventType == "tryon.failed") {
                onError?.(data);
            }
            const timer = this.#timerMap.get(tryonId);
            if (timer)
                clearTimeout(timer);
            this.#timerMap.delete(tryonId);
        };
        socket.onclose = () => {
            onClose?.();
        };
        socket.onerror = (event) => {
            onError?.(event);
        };
    };
    handleTryOnSubmit({ shopDomain, products, selectedUserImages, requestSource, callbackUrl, openTryonId, selectedProductImageUrl, requestedTryonViews }) {
        if ((0, utils_js_1.checkParameters)(shopDomain, products) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        const payload = {
            products,
            customerStoreUrl: shopDomain,
            ...(selectedUserImages !== undefined && selectedUserImages !== null && { selectedUserImages }),
            ...(requestSource !== undefined && requestSource !== null && { requestSource }),
            ...(callbackUrl !== undefined && callbackUrl !== null && { callbackUrl }),
            ...(openTryonId !== undefined && openTryonId !== null && { openTryonId }),
            ...(selectedProductImageUrl !== undefined && selectedProductImageUrl !== null && { selectedProductImageUrl }),
            ...(requestedTryonViews && requestedTryonViews?.length > 0 && { requestedTryonViews }),
        };
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON}`;
        return axios_1.default.post(url, payload, {
            headers: this.#getHeaders(),
        });
    }
    #handleGetTryOnResult = async ({ onSuccess, onError, tryonId }) => {
        try {
            const data = await this.getTryOnResult({ tryonId });
            onSuccess?.(data.data);
        }
        catch (error) {
            onError?.(error);
        }
    };
    getShareLink(tryonId) {
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON_SHARE}`, { tryonId }, {
            headers: this.#getHeaders(),
        });
    }
    getTryOnResult = ({ tryonId }) => {
        if ((0, utils_js_1.checkParameters)(tryonId) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}/${tryonId}`;
        return axios_1.default.post(url, null, {
            headers: this.#getHeaders(),
        });
    };
    getProductImageEligibility({ storeUrl, productHandle, imageURL, productDescription }) {
        if ((0, utils_js_1.checkParameters)(storeUrl, productHandle, imageURL) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        const payload = { storeUrl, productHandle, imageURL, productDescription: productDescription ?? null };
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.TRY_ON_PRODUCT_IMAGE_ELIGIBILTY}`;
        return axios_1.default.post(url, payload, {
            headers: this.#getHeaders(),
        });
    }
}
exports.default = TryOn;
