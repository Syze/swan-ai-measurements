"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
const enum_js_1 = require("./enum.js");
class Measurement {
    #socketRefs = {};
    #waitingTimers = {};
    #pollingTimers = {};
    #pollingCounts = {};
    /**
     * Handles for the deferred opens in #handleSocket.
     *
     * The socket is created after a delay (5s for measurement, 1s for face), so
     * between the call and that timer firing there is nothing to close. Without
     * this, closing in that window is a no-op and the socket opens afterwards
     * anyway — which is exactly what a quick retry does.
     */
    #openTimers = {};
    #accessKey;
    #urlType;
    #token;
    constructor(accessKey, urlType = enum_js_1.URLType.PROD, token) {
        this.#accessKey = accessKey;
        this.#urlType = urlType;
        this.#token = token;
    }
    #getHeaders() {
        return {
            ...(this.#accessKey ? { "X-Api-Key": this.#accessKey } : {}),
            ...(this.#token ? { Authorization: `Bearer ${this.#token}` } : {}),
        };
    }
    getMeasurementResult(scanId) {
        if (!(0, utils_js_1.checkParameters)(scanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}/measurements?scanId=${scanId}`;
        return axios_1.default.get(url, {
            headers: this.#getHeaders(),
        });
    }
    getMeasurementRecommendation({ scanId, shopDomain, productName }) {
        if (!(0, utils_js_1.checkParameters)(scanId, shopDomain, productName)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.RECOMMENDATION}/scan/${scanId}/shop/${shopDomain}/product/${productName}`, {
            headers: this.#getHeaders(),
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
    /**
     * Everything holding a scan open: the pending open, the socket, the fallback
     * timer and the polling timer.
     *
     * Deliberately separate from #disconnectSocket rather than folded into it.
     * #handleTimeOut starts polling and *then* calls #disconnectSocket, so a
     * version of that method which also cleared #pollingTimers would cancel the
     * polling it had just scheduled — the fallback would silently stop working.
     */
    #closeSocketAndTimers(key) {
        if (this.#openTimers[key]) {
            clearTimeout(this.#openTimers[key]);
            this.#openTimers[key] = null;
        }
        this.#disconnectSocket(key);
        if (this.#pollingTimers[key]) {
            clearTimeout(this.#pollingTimers[key]);
            this.#pollingTimers[key] = null;
        }
        this.#pollingCounts[key] = 1;
    }
    /**
     * Releases everything held for one body scan.
     *
     * Callers own the lifetime, because only they know when a result is final.
     * The client cannot tell: a socket that has delivered a final frame looks the
     * same as one still waiting, and closing on the caller's behalf would cut off
     * the late result that is the only signal a scan failed after the user moved
     * on. Safe to call more than once, and for a scan that never opened a socket.
     */
    closeMeasurementSocket(scanId) {
        if (!scanId)
            return;
        this.#closeSocketAndTimers(`measurement-${scanId}`);
    }
    /** As closeMeasurementSocket, for a face scan. */
    closeFaceScanSocket(faceScanId) {
        if (!faceScanId)
            return;
        this.#closeSocketAndTimers(`faceScan-${faceScanId}`);
    }
    #handleTimeOut(options, key) {
        const { scanId, onSuccess, onError } = options;
        this.#pollingCounts[key] = 1;
        this.#waitingTimers[key] = setTimeout(() => {
            this.#handlePolling({ scanId, onSuccess, onError }, key);
            this.#disconnectSocket(key);
        }, 1.5 * 60000);
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
            else if (res?.data?.failureReason) {
                this.#pollingCounts[key] = 1;
                clearInterval(this.#pollingTimers[key]);
                onError?.({ scanStatus: "failed", message: res.data.failureReason, isMeasured: false });
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
    #handleSocket({ onOpen, isFallback, scanId, onSuccess, onError, onClose, paramsKey, faceScanId, delay, onPreopen }) {
        const key = isFallback ? `measurement-${scanId}` : `faceScan-${faceScanId}`;
        this.#openTimers[key] = setTimeout(() => {
            this.#openTimers[key] = null;
            this.#disconnectSocket(key);
            onPreopen?.();
            const url = `${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_BASE_WEBSOCKET_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.SCANNING}?${paramsKey}=${scanId || faceScanId}`;
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
                    onError?.(data);
                }
                clearTimeout(this.#waitingTimers[key]);
            };
            socket.onclose = () => onClose?.();
            socket.onerror = () => {
                if (!isFallback) {
                    onError?.(new Error("An error occurred in the WebSocket connection."));
                }
            };
        }, delay);
    }
}
exports.default = Measurement;
