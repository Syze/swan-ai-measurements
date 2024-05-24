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
var _Measurement_instances, _Measurement_tryOnSocketRef, _Measurement_measurementSocketRef, _Measurement_timerPollingRef, _Measurement_timerWaitingRef, _Measurement_count, _Measurement_accessKey, _Measurement_getMeasurementsCheck, _Measurement_handlePolling, _Measurement_disconnectSocket, _Measurement_handleTimeOut;
import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_RECOMMENDATION_WEBSOCKET_URL, APP_TRY_ON_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";
class Measurement {
    constructor(accessKey) {
        _Measurement_instances.add(this);
        _Measurement_tryOnSocketRef.set(this, null);
        _Measurement_measurementSocketRef.set(this, null);
        _Measurement_timerPollingRef.set(this, null);
        _Measurement_timerWaitingRef.set(this, null);
        _Measurement_count.set(this, 1);
        _Measurement_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _Measurement_accessKey, accessKey, "f");
    }
    getMeasurementResult(scanId) {
        if (!checkParameters(scanId)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        const url = `${APP_AUTH_BASE_URL}/measurements?scanId=${scanId}`;
        return axios.get(url, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _Measurement_accessKey, "f") },
        });
    }
    getTryOnMeasurements({ scanId, shopDomain, productName }) {
        if (!checkParameters(scanId, shopDomain, productName)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_SCAN}/${scanId}/shop/${shopDomain}/product/${productName}`;
        return axios.get(tryOnUrl, { headers: { "X-Api-Key": __classPrivateFieldGet(this, _Measurement_accessKey, "f") } });
    }
    handleTryOnSocket(options) {
        var _a;
        const { shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen } = options;
        if (!checkParameters(shopDomain, scanId, productName)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        (_a = __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f")) === null || _a === void 0 ? void 0 : _a.close();
        const url = `${APP_TRY_ON_WEBSOCKET_URL}/develop?store_url=${shopDomain}&product_name=${productName}&scan_id=${scanId}`;
        __classPrivateFieldSet(this, _Measurement_tryOnSocketRef, new WebSocket(url), "f");
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onopen = () => {
            onOpen === null || onOpen === void 0 ? void 0 : onOpen();
        };
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onmessage = (event) => {
            const data = JSON.parse(event.data);
            if ((data === null || data === void 0 ? void 0 : data.tryOnProcessStatus) === "available") {
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
            }
            else {
                onError === null || onError === void 0 ? void 0 : onError({ message: "failed to get image urls" });
            }
        };
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onclose = () => {
            onClose === null || onClose === void 0 ? void 0 : onClose();
        };
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onerror = (event) => {
            onError === null || onError === void 0 ? void 0 : onError(event);
        };
    }
    handleMeasurementSocket(options) {
        const { scanId, onError, onSuccess, onClose, onOpen } = options;
        if (!checkParameters(scanId)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        setTimeout(() => {
            __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_disconnectSocket).call(this);
            const url = `${APP_RECOMMENDATION_WEBSOCKET_URL}?scanId=${scanId}`;
            __classPrivateFieldSet(this, _Measurement_measurementSocketRef, new WebSocket(url), "f");
            __classPrivateFieldGet(this, _Measurement_measurementSocketRef, "f").onopen = () => {
                onOpen === null || onOpen === void 0 ? void 0 : onOpen();
                __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handleTimeOut).call(this, { scanId, onSuccess, onError });
            };
            __classPrivateFieldGet(this, _Measurement_measurementSocketRef, "f").onmessage = (event) => {
                const data = JSON.parse(event.data);
                if ((data === null || data === void 0 ? void 0 : data.code) === 200 && (data === null || data === void 0 ? void 0 : data.scanStatus) === "success") {
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
                }
                else {
                    onError === null || onError === void 0 ? void 0 : onError(data);
                }
                if (__classPrivateFieldGet(this, _Measurement_timerWaitingRef, "f")) {
                    clearTimeout(__classPrivateFieldGet(this, _Measurement_timerWaitingRef, "f"));
                }
            };
            __classPrivateFieldGet(this, _Measurement_measurementSocketRef, "f").onclose = () => {
                onClose === null || onClose === void 0 ? void 0 : onClose();
            };
            __classPrivateFieldGet(this, _Measurement_measurementSocketRef, "f").onerror = (event) => {
                onError === null || onError === void 0 ? void 0 : onError(event);
            };
        }, 5000);
    }
}
_Measurement_tryOnSocketRef = new WeakMap(), _Measurement_measurementSocketRef = new WeakMap(), _Measurement_timerPollingRef = new WeakMap(), _Measurement_timerWaitingRef = new WeakMap(), _Measurement_count = new WeakMap(), _Measurement_accessKey = new WeakMap(), _Measurement_instances = new WeakSet(), _Measurement_getMeasurementsCheck = function _Measurement_getMeasurementsCheck(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        var _b;
        const { scanId, onSuccess, onError } = options;
        try {
            const res = yield this.getMeasurementResult(scanId);
            if ((res === null || res === void 0 ? void 0 : res.data) && ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.isMeasured) === true) {
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(res.data);
                if (__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f")) {
                    clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
                }
            }
            else {
                if (__classPrivateFieldGet(this, _Measurement_count, "f") < 8) {
                    __classPrivateFieldSet(this, _Measurement_count, (_b = __classPrivateFieldGet(this, _Measurement_count, "f"), _b++, _b), "f");
                    __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handlePolling).call(this, { scanId, onSuccess, onError });
                }
                else {
                    __classPrivateFieldSet(this, _Measurement_count, 1, "f");
                    if (__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f")) {
                        clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
                    }
                    onError === null || onError === void 0 ? void 0 : onError({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
                }
            }
        }
        catch (e) {
            if (__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f")) {
                clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
            }
            onError === null || onError === void 0 ? void 0 : onError(e);
        }
    });
}, _Measurement_handlePolling = function _Measurement_handlePolling(options) {
    const { scanId, onSuccess, onError } = options;
    if (__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f")) {
        clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
    }
    __classPrivateFieldSet(this, _Measurement_timerPollingRef, setTimeout(() => {
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_getMeasurementsCheck).call(this, { scanId, onSuccess, onError });
    }, __classPrivateFieldGet(this, _Measurement_count, "f") * 5000), "f");
}, _Measurement_disconnectSocket = function _Measurement_disconnectSocket() {
    var _a;
    (_a = __classPrivateFieldGet(this, _Measurement_measurementSocketRef, "f")) === null || _a === void 0 ? void 0 : _a.close();
    if (__classPrivateFieldGet(this, _Measurement_timerWaitingRef, "f")) {
        clearTimeout(__classPrivateFieldGet(this, _Measurement_timerWaitingRef, "f"));
    }
}, _Measurement_handleTimeOut = function _Measurement_handleTimeOut(options) {
    const { scanId, onSuccess, onError } = options;
    __classPrivateFieldSet(this, _Measurement_count, 1, "f");
    __classPrivateFieldSet(this, _Measurement_timerWaitingRef, setTimeout(() => {
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handlePolling).call(this, { scanId, onSuccess, onError });
        __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_disconnectSocket).call(this);
    }, 2 * 60000), "f");
};
export default Measurement;
