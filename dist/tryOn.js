"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
class TryOn {
    #tryOnSocketRef = null;
    #timerWaitingRef = null;
    #accessKey;
    #stagingUrl;
    constructor(accessKey, stagingUrl = false) {
        this.#accessKey = accessKey;
        this.#stagingUrl = stagingUrl;
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
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": this.#accessKey,
            },
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
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}`, payload, {
            headers: { "X-Api-Key": this.#accessKey },
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
        return axios_1.default.delete(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_URLS}`, {
            headers: { "X-Api-Key": this.#accessKey },
            data: payload,
        });
    }
    #disconnectSocket = () => {
        this.#tryOnSocketRef?.close();
        if (this.#timerWaitingRef) {
            clearTimeout(this.#timerWaitingRef);
        }
    };
    #handleTimeOut = ({ onSuccess, onError, shopDomain, userEmail, productName }) => {
        this.#timerWaitingRef = setTimeout(() => {
            this.#handleGetTryOnResult({ shopDomain, userEmail, productName, onSuccess, onError });
            this.#disconnectSocket();
        }, 138000);
    };
    handleTryOnWebSocket = ({ userEmail, shopDomain, tryonId, productName, onError, onSuccess, onClose, onOpen }) => {
        if ((0, utils_js_1.checkParameters)(shopDomain, tryonId, productName, userEmail) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        this.#disconnectSocket();
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON}?tryonId=${tryonId}`;
        this.#tryOnSocketRef = new WebSocket(url);
        if (this.#tryOnSocketRef) {
            this.#tryOnSocketRef.onopen = async () => {
                onOpen?.();
                this.#handleTimeOut({ onSuccess, onError, shopDomain, userEmail, productName });
            };
            this.#tryOnSocketRef.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                }
                catch (error) {
                    console.log(data, error, "not correct format for data");
                    return;
                }
                if (data?.status === "success") {
                    onSuccess?.(data);
                }
                else {
                    onError?.(data);
                }
                if (this.#timerWaitingRef) {
                    clearTimeout(this.#timerWaitingRef);
                }
            };
            this.#tryOnSocketRef.onclose = () => {
                onClose?.();
            };
            this.#tryOnSocketRef.onerror = (event) => {
                onError?.(event);
                if (this.#timerWaitingRef) {
                    clearTimeout(this.#timerWaitingRef);
                }
            };
        }
        else {
            console.log("no connection made for websocket");
        }
    };
    handleTryOnSubmit({ userEmail, shopDomain, productName, selectedUserImages, requestSource, callbackUrl, openTryonId, selectedProductImageUrl }) {
        if ((0, utils_js_1.checkParameters)(shopDomain, userEmail, productName, selectedUserImages) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!selectedUserImages.length) {
            throw new Error("No user images found!");
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        const payload = {
            productName,
            userEmail,
            customerStoreUrl: shopDomain,
            selectedUserImages,
            ...(requestSource !== undefined && requestSource !== null && { requestSource }),
            ...(callbackUrl !== undefined && callbackUrl !== null && { callbackUrl }),
            ...(openTryonId !== undefined && openTryonId !== null && { openTryonId }),
            ...(selectedProductImageUrl !== undefined && selectedProductImageUrl !== null && { selectedProductImageUrl })
        };
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON}`;
        return axios_1.default.post(url, payload, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    #handleGetTryOnResult = async ({ onSuccess, onError, shopDomain, userEmail, productName }) => {
        try {
            const data = await this.getTryOnResult({ shopDomain, userEmail, productName });
            onSuccess?.(data.data);
        }
        catch (error) {
            onError?.(error);
        }
    };
    getShareLink(tryonId) {
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_SHARE}`, { tryonId }, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    getTryOnResult = ({ userEmail, shopDomain, productName }) => {
        if ((0, utils_js_1.checkParameters)(shopDomain, userEmail, productName) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        const payload = {
            productName,
            userEmail,
            customerStoreUrl: shopDomain,
        };
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}`;
        return axios_1.default.post(url, payload, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    };
    getProductImageEligibility({ storeUrl, productHandle, imageURL, productDescription }) {
        if ((0, utils_js_1.checkParameters)(storeUrl, productHandle, imageURL) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        const payload = { storeUrl, productHandle, imageURL, productDescription: productDescription ?? null };
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_PRODUCT_IMAGE_ELIGIBILTY}`;
        return axios_1.default.post(url, payload, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
}
exports.default = TryOn;
