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
    async uploadFile({ files, userEmail }) {
        userEmail = userEmail.trim();
        if ((0, utils_js_1.checkParameters)(files, userEmail) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail)) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        if (files?.length > 2) {
            throw new Error("Cannot allow more than 2 files.");
        }
        try {
            const payload = {
                userEmail,
                userImages: [files[0]?.name],
            };
            if (files[1]) {
                payload.userImages.push(files[1].name);
            }
            const signedUrlRes = await this.#getSignedUrl(payload);
            for (const file of files) {
                await this.#s3Upload(signedUrlRes.data.uploadUrls[file.name].url, file);
            }
            return "uploaded successfully!";
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
        userEmail = userEmail.trim();
        if ((0, utils_js_1.checkParameters)(userEmail) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail)) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        const payload = {
            userEmail
        };
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}`, payload, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    deleteImage({ userEmail, fileName }) {
        userEmail = userEmail.trim();
        if ((0, utils_js_1.checkParameters)(userEmail, fileName) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail)) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        const payload = {
            userEmail,
            file: fileName
        };
        return axios_1.default.delete(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_IMAGE_URLS}`, {
            headers: { "X-Api-Key": this.#accessKey },
            data: payload
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
        if ((0, utils_js_1.checkParameters)(shopDomain, tryonId, productName) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        this.#disconnectSocket();
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}?tryonId=${tryonId}`;
        this.#tryOnSocketRef = new WebSocket(url);
        this.#tryOnSocketRef.onopen = async () => {
            onOpen?.();
            this.#handleTimeOut({ onSuccess, onError, shopDomain, userEmail, productName });
        };
        this.#tryOnSocketRef.onmessage = (event) => {
            const data = JSON.parse(event.data);
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
    };
    handleSumbmitTryOn = async ({ userEmail, shopDomain, productName, firstImageName, secondImageName, onError }) => {
        userEmail = userEmail.trim();
        if ((0, utils_js_1.checkParameters)(shopDomain, userEmail, productName, firstImageName, secondImageName) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail)) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        try {
            const payload = {
                productName,
                userEmail,
                customerStoreUrl: shopDomain,
                selectedUserImages: [
                    firstImageName,
                    secondImageName
                ]
            };
            const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON}`;
            const res = await axios_1.default.post(url, payload, {
                headers: { "X-Api-Key": this.#accessKey },
            });
            if (res?.data?.tryOnProcessStatus === "failed") {
                this.#disconnectSocket();
                throw res.data;
            }
            else {
                return res.data;
            }
        }
        catch (error) {
            onError?.(error);
            this.#disconnectSocket();
            throw error;
        }
    };
    #handleGetTryOnResult = async ({ onSuccess, onError, shopDomain, userEmail, productName }) => {
        try {
            const data = await this.getTryOnResult({ shopDomain, userEmail, productName });
            onSuccess?.(data.data);
        }
        catch (error) {
            onError?.(error);
        }
    };
    getTryOnResult = ({ userEmail, shopDomain, productName }) => {
        userEmail = userEmail.trim();
        if ((0, utils_js_1.checkParameters)(shopDomain, userEmail, productName) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(userEmail)) {
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
}
exports.default = TryOn;
