"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
class Measurement {
    #tryOnSocketRef = null;
    #measurementSocketRef = null;
    #timerPollingRef = null;
    #timerWaitingRef = null;
    #count = 1;
    #accessKey;
    #stagingUrl;
    constructor(accessKey, stagingUrl = false) {
        this.#accessKey = accessKey;
        this.#stagingUrl = stagingUrl;
    }
    getMeasurementResult(scanId) {
        if (!(0, utils_js_1.checkParameters)(scanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}/measurements?scanId=${scanId}`;
        return axios_1.default.get(url, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    getMeasurementRecommendation({ scanId, shopDomain, productName }) {
        if (!(0, utils_js_1.checkParameters)(scanId, shopDomain, productName)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.RECOMMENDATION}/scan/${scanId}/shop/${shopDomain}/product/${productName}`, { headers: { "X-Api-Key": this.#accessKey } });
    }
    getTryOnMeasurements({ scanId, shopDomain, productName }) {
        if (!(0, utils_js_1.checkParameters)(scanId, shopDomain, productName)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        const tryOnUrl = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.TRY_ON_SCAN}/${scanId}/shop/${shopDomain}/product/${productName}`;
        return axios_1.default.get(tryOnUrl, { headers: { "X-Api-Key": this.#accessKey } });
    }
    handleTryOnSocket(options) {
        const { shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen } = options;
        if (!(0, utils_js_1.checkParameters)(shopDomain, scanId, productName)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        this.#tryOnSocketRef?.close();
        const url = `${(0, utils_js_1.getUrl)({
            urlName: constants_js_1.APP_BASE_WEBSOCKET_URL,
            stagingUrl: this.#stagingUrl,
        })}/develop?store_url=${shopDomain}&product_name=${productName}&scan_id=${scanId}`;
        this.#tryOnSocketRef = new WebSocket(url);
        this.#tryOnSocketRef.onopen = () => {
            onOpen?.();
        };
        this.#tryOnSocketRef.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data?.tryOnProcessStatus === "available") {
                onSuccess?.(data);
            }
            else {
                onError?.({ message: "failed to get image urls" });
            }
        };
        this.#tryOnSocketRef.onclose = () => {
            onClose?.();
        };
        this.#tryOnSocketRef.onerror = (event) => {
            onError?.(event);
        };
    }
    async #getMeasurementsCheck(options) {
        const { scanId, onSuccess, onError } = options;
        try {
            const res = await this.getMeasurementResult(scanId);
            if (res?.data && res?.data?.isMeasured === true) {
                onSuccess?.(res.data);
                if (this.#timerPollingRef) {
                    clearInterval(this.#timerPollingRef);
                }
            }
            else {
                if (this.#count < 8) {
                    this.#count++;
                    this.#handlePolling({ scanId, onSuccess, onError });
                }
                else {
                    this.#count = 1;
                    if (this.#timerPollingRef) {
                        clearInterval(this.#timerPollingRef);
                    }
                    onError?.({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
                }
            }
        }
        catch (e) {
            if (this.#timerPollingRef) {
                clearInterval(this.#timerPollingRef);
            }
            onError?.(e);
        }
    }
    #handlePolling(options) {
        const { scanId, onSuccess, onError } = options;
        if (this.#timerPollingRef) {
            clearInterval(this.#timerPollingRef);
        }
        this.#timerPollingRef = setTimeout(() => {
            this.#getMeasurementsCheck({ scanId, onSuccess, onError });
        }, this.#count * 5000);
    }
    #disconnectSocket() {
        this.#measurementSocketRef?.close();
        if (this.#timerWaitingRef) {
            clearTimeout(this.#timerWaitingRef);
        }
    }
    #handleTimeOut(options) {
        const { scanId, onSuccess, onError } = options;
        this.#count = 1;
        this.#timerWaitingRef = setTimeout(() => {
            this.#handlePolling({ scanId, onSuccess, onError });
            this.#disconnectSocket();
        }, 2 * 60000);
    }
    handleMeasurementSocket(options) {
        const { scanId, onError, onSuccess, onClose, onOpen } = options;
        if (!(0, utils_js_1.checkParameters)(scanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        setTimeout(() => {
            this.#disconnectSocket();
            const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.SCANNING}?scanId=${scanId}`;
            this.#measurementSocketRef = new WebSocket(url);
            this.#measurementSocketRef.onopen = () => {
                onOpen?.();
                this.#handleTimeOut({ scanId, onSuccess, onError });
            };
            this.#measurementSocketRef.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data?.code === 200 && data?.scanStatus === "success") {
                    onSuccess?.(data);
                }
                else {
                    onError?.(data);
                }
                if (this.#timerWaitingRef) {
                    clearTimeout(this.#timerWaitingRef);
                }
            };
            this.#measurementSocketRef.onclose = () => {
                onClose?.();
            };
            this.#measurementSocketRef.onerror = (event) => {
                onError?.(event);
            };
        }, 5000);
    }
}
exports.default = Measurement;
