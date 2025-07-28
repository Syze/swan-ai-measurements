"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
class Measurement {
    #socketRefs = {};
    #waitingTimers = {};
    #pollingTimers = {};
    #pollingCounts = {};
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
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.RECOMMENDATION}/scan/${scanId}/shop/${shopDomain}/product/${productName}`, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    #disconnectSocket(key) {
        this.#socketRefs[key]?.close();
        this.#socketRefs[key] = null;
        if (this.#waitingTimers[key]) {
            clearTimeout(this.#waitingTimers[key]);
            this.#waitingTimers[key] = null;
        }
    }
    #handleTimeOut(options, key) {
        const { scanId, onSuccess, onError } = options;
        this.#pollingCounts[key] = 1;
        this.#waitingTimers[key] = setTimeout(() => {
            this.#handlePolling({ scanId, onSuccess, onError }, key);
            this.#disconnectSocket(key);
        }, 2 * 60000);
    }
    #handlePolling(options, key) {
        const { scanId, onSuccess, onError } = options;
        if (this.#pollingTimers[key]) {
            clearTimeout(this.#pollingTimers[key]);
        }
        this.#pollingTimers[key] = setTimeout(() => {
            this.#getMeasurementsCheck({ scanId, onSuccess, onError }, key);
        }, (this.#pollingCounts[key] || 1) * 5000);
    }
    async #getMeasurementsCheck(options, key) {
        const { scanId, onSuccess, onError } = options;
        try {
            const res = await this.getMeasurementResult(scanId);
            if (res?.data && res?.data?.isMeasured === true) {
                onSuccess?.(res.data);
                clearInterval(this.#pollingTimers[key]);
            }
            else {
                if ((this.#pollingCounts[key] || 1) < 8) {
                    this.#pollingCounts[key] = (this.#pollingCounts[key] || 1) + 1;
                    this.#handlePolling({ scanId, onSuccess, onError }, key);
                }
                else {
                    this.#pollingCounts[key] = 1;
                    clearInterval(this.#pollingTimers[key]);
                    onError?.({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
                }
            }
        }
        catch (e) {
            clearInterval(this.#pollingTimers[key]);
            onError?.(e);
        }
    }
    handleMeasurementSocket(options) {
        const { scanId, onError, onSuccess, onClose, onOpen } = options;
        if (!(0, utils_js_1.checkParameters)(scanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        this.#handleSocket({ onOpen, scanId, onSuccess, onError, onClose, paramsKey: "scanId", isFallback: true, delay: 5000 });
    }
    handlFaceScaneSocket(options) {
        const { faceScanId, onError, onSuccess, onClose, onOpen } = options;
        if (!(0, utils_js_1.checkParameters)(faceScanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        this.#handleSocket({ onOpen, faceScanId, onSuccess, onError, onClose, paramsKey: "faceScanId", isFallback: false, delay: 1000 });
    }
    #handleSocket({ onOpen, isFallback, scanId, onSuccess, onError, onClose, paramsKey, faceScanId, delay }) {
        const key = isFallback ? "measurement" : "faceScan";
        setTimeout(() => {
            this.#disconnectSocket(key);
            const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.SCANNING}?${paramsKey}=${scanId || faceScanId}`;
            const socket = new WebSocket(url);
            this.#socketRefs[key] = socket;
            socket.onopen = () => {
                onOpen?.();
                if (isFallback && scanId) {
                    this.#handleTimeOut({ scanId, onSuccess, onError }, key);
                }
            };
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data?.code === 200 && data?.scanStatus === "success") {
                    onSuccess?.(data);
                }
                else {
                    clearTimeout(this.#waitingTimers[key]);
                    onError?.(data);
                }
                if (data?.code === 200 && data?.scanStatus === "success" && data?.resultType === "final") {
                    clearTimeout(this.#waitingTimers[key]);
                }
            };
            socket.onclose = () => onClose?.();
            socket.onerror = () => { };
        }, delay);
    }
}
exports.default = Measurement;
