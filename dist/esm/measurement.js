var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Measurement_instances, _Measurement_socketRefs, _Measurement_waitingTimers, _Measurement_pollingTimers, _Measurement_pollingCounts, _Measurement_accessKey, _Measurement_urlType, _Measurement_token, _Measurement_getHeaders, _Measurement_disconnectSocket, _Measurement_handleTimeOut, _Measurement_handlePolling, _Measurement_getMeasurementsCheck, _Measurement_handleSocket;
import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";
import { URLType } from "./enum.js";
class Measurement {
    constructor(accessKey, urlType = URLType.PROD, token) {
        _Measurement_instances.add(this);
        _Measurement_socketRefs.set(this, {});
        _Measurement_waitingTimers.set(this, {});
        _Measurement_pollingTimers.set(this, {});
        _Measurement_pollingCounts.set(this, {});
        _Measurement_accessKey.set(this, void 0);
        _Measurement_urlType.set(this, void 0);
        _Measurement_token.set(this, void 0);
        __classPrivateFieldSet(this, _Measurement_accessKey, accessKey, "f");
        __classPrivateFieldSet(this, _Measurement_urlType, urlType, "f");
        __classPrivateFieldSet(this, _Measurement_token, token, "f");
    }
    getMeasurementResult(scanId) {
        if (!checkParameters(scanId)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: __classPrivateFieldGet(this, _Measurement_urlType, "f") })}/measurements?scanId=${scanId}`;
        return axios.get(url, {
            headers: __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_getHeaders).call(this),
        });
    }
    getMeasurementRecommendation({ scanId, shopDomain, productName }) {
        if (!checkParameters(scanId, shopDomain, productName)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: __classPrivateFieldGet(this, _Measurement_urlType, "f") })}${API_ENDPOINTS.RECOMMENDATION}/scan/${scanId}/shop/${shopDomain}/product/${productName}`, {
            headers: __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_getHeaders).call(this),
        });
    }
    handleMeasurementSocket(options) {
        const { scanId, onError, onSuccess, onClose, onOpen } = options;
        if (!checkParameters(scanId)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handleSocket).call(this, { onOpen, scanId, onSuccess, onError, onClose, paramsKey: "scanId", isFallback: true, delay: 5000 });
    }
    handlFaceScaneSocket(options) {
        const { faceScanId, onError, onSuccess, onClose, onOpen } = options;
        if (!checkParameters(faceScanId)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handleSocket).call(this, { onOpen, faceScanId, onSuccess, onError, onClose, paramsKey: "faceScanId", isFallback: false, delay: 1000 });
    }
}
_Measurement_socketRefs = new WeakMap(), _Measurement_waitingTimers = new WeakMap(), _Measurement_pollingTimers = new WeakMap(), _Measurement_pollingCounts = new WeakMap(), _Measurement_accessKey = new WeakMap(), _Measurement_urlType = new WeakMap(), _Measurement_token = new WeakMap(), _Measurement_instances = new WeakSet(), _Measurement_getHeaders = function _Measurement_getHeaders() {
    return Object.assign(Object.assign({}, (__classPrivateFieldGet(this, _Measurement_accessKey, "f") ? { "X-Api-Key": __classPrivateFieldGet(this, _Measurement_accessKey, "f") } : {})), (__classPrivateFieldGet(this, _Measurement_token, "f") ? { Authorization: `Bearer ${__classPrivateFieldGet(this, _Measurement_token, "f")}` } : {}));
}, _Measurement_disconnectSocket = function _Measurement_disconnectSocket(key) {
    var _a;
    (_a = __classPrivateFieldGet(this, _Measurement_socketRefs, "f")[key]) === null || _a === void 0 ? void 0 : _a.close();
    __classPrivateFieldGet(this, _Measurement_socketRefs, "f")[key] = null;
    if (__classPrivateFieldGet(this, _Measurement_waitingTimers, "f")[key]) {
        clearTimeout(__classPrivateFieldGet(this, _Measurement_waitingTimers, "f")[key]);
        __classPrivateFieldGet(this, _Measurement_waitingTimers, "f")[key] = null;
    }
}, _Measurement_handleTimeOut = function _Measurement_handleTimeOut(options, key) {
    const { scanId, onSuccess, onError } = options;
    __classPrivateFieldGet(this, _Measurement_pollingCounts, "f")[key] = 1;
    __classPrivateFieldGet(this, _Measurement_waitingTimers, "f")[key] = setTimeout(() => {
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handlePolling).call(this, { scanId, onSuccess, onError }, key);
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_disconnectSocket).call(this, key);
    }, 1.5 * 60000);
}, _Measurement_handlePolling = function _Measurement_handlePolling(options, key) {
    const { scanId, onSuccess, onError } = options;
    if (__classPrivateFieldGet(this, _Measurement_pollingTimers, "f")[key]) {
        clearTimeout(__classPrivateFieldGet(this, _Measurement_pollingTimers, "f")[key]);
    }
    __classPrivateFieldGet(this, _Measurement_pollingTimers, "f")[key] = setTimeout(() => {
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_getMeasurementsCheck).call(this, { scanId, onSuccess, onError }, key);
    }, (__classPrivateFieldGet(this, _Measurement_pollingCounts, "f")[key] || 1) * 5000);
}, _Measurement_getMeasurementsCheck = function _Measurement_getMeasurementsCheck(options, key) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { scanId, onSuccess, onError } = options;
        try {
            const res = yield this.getMeasurementResult(scanId);
            if ((res === null || res === void 0 ? void 0 : res.data) && ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.isMeasured) === true) {
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(res.data);
                clearInterval(__classPrivateFieldGet(this, _Measurement_pollingTimers, "f")[key]);
            }
            else {
                if ((__classPrivateFieldGet(this, _Measurement_pollingCounts, "f")[key] || 1) < 8) {
                    __classPrivateFieldGet(this, _Measurement_pollingCounts, "f")[key] = (__classPrivateFieldGet(this, _Measurement_pollingCounts, "f")[key] || 1) + 1;
                    __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handlePolling).call(this, { scanId, onSuccess, onError }, key);
                }
                else {
                    __classPrivateFieldGet(this, _Measurement_pollingCounts, "f")[key] = 1;
                    clearInterval(__classPrivateFieldGet(this, _Measurement_pollingTimers, "f")[key]);
                    onError === null || onError === void 0 ? void 0 : onError({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
                }
            }
        }
        catch (e) {
            clearInterval(__classPrivateFieldGet(this, _Measurement_pollingTimers, "f")[key]);
            onError === null || onError === void 0 ? void 0 : onError(e);
        }
    });
}, _Measurement_handleSocket = function _Measurement_handleSocket({ onOpen, isFallback, scanId, onSuccess, onError, onClose, paramsKey, faceScanId, delay, onPreopen }) {
    const key = isFallback ? `measurement-${scanId}` : `faceScan-${faceScanId}`;
    setTimeout(() => {
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_disconnectSocket).call(this, key);
        onPreopen === null || onPreopen === void 0 ? void 0 : onPreopen();
        const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, urlType: __classPrivateFieldGet(this, _Measurement_urlType, "f") })}${API_ENDPOINTS.SCANNING}?${paramsKey}=${scanId || faceScanId}`;
        const socket = new WebSocket(url);
        __classPrivateFieldGet(this, _Measurement_socketRefs, "f")[key] = socket;
        socket.onopen = () => {
            onOpen === null || onOpen === void 0 ? void 0 : onOpen();
            if (isFallback && scanId) {
                __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handleTimeOut).call(this, { scanId, onSuccess, onError }, key);
            }
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if ((data === null || data === void 0 ? void 0 : data.code) === 200 && (data === null || data === void 0 ? void 0 : data.scanStatus) === "success") {
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
            }
            else {
                clearTimeout(__classPrivateFieldGet(this, _Measurement_waitingTimers, "f")[key]);
                onError === null || onError === void 0 ? void 0 : onError(data);
            }
            if ((data === null || data === void 0 ? void 0 : data.code) === 200 && (data === null || data === void 0 ? void 0 : data.scanStatus) === "success" && (data === null || data === void 0 ? void 0 : data.resultType) === "final") {
                clearTimeout(__classPrivateFieldGet(this, _Measurement_waitingTimers, "f")[key]);
            }
        };
        socket.onclose = () => onClose === null || onClose === void 0 ? void 0 : onClose();
        socket.onerror = () => {
            if (!isFallback) {
                onError === null || onError === void 0 ? void 0 : onError(new Error("An error occurred in the WebSocket connection."));
            }
        };
    }, delay);
};
export default Measurement;
