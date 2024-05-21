"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var axios = require("axios");
var _a = require("./constants.js"), API_ENDPOINTS = _a.API_ENDPOINTS, APP_AUTH_BASE_URL = _a.APP_AUTH_BASE_URL, APP_RECOMMENDATION_WEBSOCKET_URL = _a.APP_RECOMMENDATION_WEBSOCKET_URL, APP_TRY_ON_WEBSOCKET_URL = _a.APP_TRY_ON_WEBSOCKET_URL, REQUIRED_MESSAGE = _a.REQUIRED_MESSAGE;
var checkParameters = require("./utils.js").checkParameters;
/**
 * Class representing measurement-related functionality.
 */
var Measurement = /** @class */ (function () {
    /**
     * Constructs a new instance of the Measurement class.
     * @param {string} accessKey - The access key used for authentication.
     */
    function Measurement(accessKey) {
        _Measurement_instances.add(this);
        _Measurement_tryOnSocketRef.set(this, null);
        _Measurement_measurementSocketRef.set(this, null);
        _Measurement_timerPollingRef.set(this, null);
        _Measurement_timerWaitingRef.set(this, null);
        _Measurement_count.set(this, 1);
        _Measurement_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _Measurement_accessKey, accessKey, "f");
    }
    /**
     * Retrieves the measurement status for a given scan ID.
     * @param {string} scanId - The ID of the scan.
     * @returns {Promise} - The axios response promise.
     * @throws {Error} - If the required parameter is missing.
     */
    Measurement.prototype.getMeasurementStatus = function (scanId) {
        if (checkParameters(scanId) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        var url = "".concat(APP_AUTH_BASE_URL, "/measurements?scanId=").concat(scanId);
        return axios.get(url, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _Measurement_accessKey, "f") },
        });
    };
    /**
     * Retrieves the try-on measurements for a given scan ID, shop domain, and product name.
     * @param {Object} params - The parameters for the try-on measurements.
     * @param {string} params.scanId - The ID of the scan.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.productName - The product name.
     * @returns {Promise} - The axios response promise.
     * @throws {Error} - If the required parameters are missing.
     */
    Measurement.prototype.getTryOnMeasurements = function (_a) {
        var scanId = _a.scanId, shopDomain = _a.shopDomain, productName = _a.productName;
        if (checkParameters(scanId, shopDomain, productName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        var tryOnUrl = "".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.TRY_ON_SCAN, "/").concat(scanId, "/shop/").concat(shopDomain, "/product/").concat(productName);
        return axios.get(tryOnUrl, { headers: { "X-Api-Key": __classPrivateFieldGet(this, _Measurement_accessKey, "f") } });
    };
    /**
     * Handles the try-on WebSocket connection.
     * @param {Object} params - The parameters for the WebSocket connection.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.scanId - The ID of the scan.
     * @param {string} params.productName - The product name.
     * @param {function} [params.onError] - Optional. Callback function to handle errors.
     * @param {function} [params.onSuccess] - Optional. Callback function to handle successful messages.
     * @param {function} [params.onClose] - Optional. Callback function to handle WebSocket close event.
     * @param {function} [params.onOpen] - Optional. Callback function to handle WebSocket open event.
     */
    Measurement.prototype.handleTryOnSocket = function (_a) {
        var _b;
        var shopDomain = _a.shopDomain, scanId = _a.scanId, productName = _a.productName, onError = _a.onError, onSuccess = _a.onSuccess, onClose = _a.onClose, onOpen = _a.onOpen;
        if (checkParameters(shopDomain, scanId, productName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        (_b = __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f")) === null || _b === void 0 ? void 0 : _b.close();
        var url = "".concat(APP_TRY_ON_WEBSOCKET_URL, "/develop?store_url=").concat(shopDomain, "&product_name=").concat(productName, "&scan_id=").concat(scanId);
        __classPrivateFieldSet(this, _Measurement_tryOnSocketRef, new WebSocket(url), "f");
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onopen = function () {
            onOpen === null || onOpen === void 0 ? void 0 : onOpen();
        };
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onmessage = function (event) {
            var data = JSON.parse(event.data);
            if ((data === null || data === void 0 ? void 0 : data.tryOnProcessStatus) === "available") {
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
            }
            else {
                onError === null || onError === void 0 ? void 0 : onError({ message: "failed to get image urls" });
            }
        };
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onclose = function () {
            onClose === null || onClose === void 0 ? void 0 : onClose();
        };
        __classPrivateFieldGet(this, _Measurement_tryOnSocketRef, "f").onerror = function (event) {
            onError === null || onError === void 0 ? void 0 : onError(event);
        };
    };
    /**
     * Handles the measurement WebSocket connection.
     * @param {Object} params - The parameters for the WebSocket connection.
     * @param {string} params.scanId - The ID of the scan.
     * @param {function} [params.onError] - Optional. Callback function to handle errors.
     * @param {function} [params.onSuccess] - Optional. Callback function to handle successful messages.
     * @param {function} [params.onClose] - Optional. Callback function to handle WebSocket close event.
     * @param {function} [params.onOpen] - Optional. Callback function to handle WebSocket open event.
     */
    Measurement.prototype.handleMeasurementSocket = function (_a) {
        var _this = this;
        var scanId = _a.scanId, onError = _a.onError, onSuccess = _a.onSuccess, onClose = _a.onClose, onOpen = _a.onOpen;
        if (checkParameters(scanId) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        setTimeout(function () {
            __classPrivateFieldGet(_this, _Measurement_instances, "m", _Measurement_disconnectSocket).call(_this);
            var url = "".concat(APP_RECOMMENDATION_WEBSOCKET_URL, "?scanId=").concat(scanId);
            __classPrivateFieldSet(_this, _Measurement_measurementSocketRef, new WebSocket(url), "f");
            __classPrivateFieldGet(_this, _Measurement_measurementSocketRef, "f").onopen = function () {
                onOpen === null || onOpen === void 0 ? void 0 : onOpen();
                __classPrivateFieldGet(_this, _Measurement_instances, "m", _Measurement_handleTimeOut).call(_this, { scanId: scanId, onSuccess: onSuccess, onError: onError });
            };
            __classPrivateFieldGet(_this, _Measurement_measurementSocketRef, "f").onmessage = function (event) {
                var data = JSON.parse(event.data);
                if ((data === null || data === void 0 ? void 0 : data.code) === 200 && (data === null || data === void 0 ? void 0 : data.scanStatus) === "success") {
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
                }
                else {
                    onError === null || onError === void 0 ? void 0 : onError(data);
                }
                clearTimeout(__classPrivateFieldGet(_this, _Measurement_timerWaitingRef, "f"));
            };
            __classPrivateFieldGet(_this, _Measurement_measurementSocketRef, "f").onclose = function () {
                onClose === null || onClose === void 0 ? void 0 : onClose();
            };
            __classPrivateFieldGet(_this, _Measurement_measurementSocketRef, "f").onerror = function (event) {
                onError === null || onError === void 0 ? void 0 : onError(event);
            };
        }, 5000);
    };
    return Measurement;
}());
_Measurement_tryOnSocketRef = new WeakMap(), _Measurement_measurementSocketRef = new WeakMap(), _Measurement_timerPollingRef = new WeakMap(), _Measurement_timerWaitingRef = new WeakMap(), _Measurement_count = new WeakMap(), _Measurement_accessKey = new WeakMap(), _Measurement_instances = new WeakSet(), _Measurement_getMeasurementsCheck = function _Measurement_getMeasurementsCheck(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var res, e_1;
        var _c, _d;
        var _e;
        var scanId = _b.scanId, onSuccess = _b.onSuccess, onError = _b.onError;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, this.getMeasurementStatus(scanId)];
                case 1:
                    res = _f.sent();
                    if ((res === null || res === void 0 ? void 0 : res.data) && ((_d = (_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.isMeasured) === true) {
                        onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(res === null || res === void 0 ? void 0 : res.data);
                        clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
                    }
                    else {
                        if (__classPrivateFieldGet(this, _Measurement_count, "f") < 8) {
                            __classPrivateFieldSet(this, _Measurement_count, (_e = __classPrivateFieldGet(this, _Measurement_count, "f"), _e++, _e), "f");
                            __classPrivateFieldGet(this, _Measurement_instances, "m", _Measurement_handlePolling).call(this, { scanId: scanId, onSuccess: onSuccess, onError: onError });
                        }
                        else {
                            __classPrivateFieldSet(this, _Measurement_count, 1, "f");
                            clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
                            onError === null || onError === void 0 ? void 0 : onError({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _f.sent();
                    clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
                    onError === null || onError === void 0 ? void 0 : onError(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}, _Measurement_handlePolling = function _Measurement_handlePolling(_a) {
    var _this = this;
    var scanId = _a.scanId, onSuccess = _a.onSuccess, onError = _a.onError;
    clearInterval(__classPrivateFieldGet(this, _Measurement_timerPollingRef, "f"));
    __classPrivateFieldSet(this, _Measurement_timerPollingRef, setTimeout(function () {
        __classPrivateFieldGet(_this, _Measurement_instances, "m", _Measurement_getMeasurementsCheck).call(_this, { scanId: scanId, onSuccess: onSuccess, onError: onError });
    }, __classPrivateFieldGet(this, _Measurement_count, "f") * 5000), "f");
}, _Measurement_disconnectSocket = function _Measurement_disconnectSocket() {
    var _a;
    (_a = __classPrivateFieldGet(this, _Measurement_measurementSocketRef, "f")) === null || _a === void 0 ? void 0 : _a.close();
    clearTimeout(__classPrivateFieldGet(this, _Measurement_timerWaitingRef, "f"));
}, _Measurement_handleTimeOut = function _Measurement_handleTimeOut(_a) {
    var _this = this;
    var scanId = _a.scanId, onSuccess = _a.onSuccess, onError = _a.onError;
    __classPrivateFieldSet(this, _Measurement_count, 1, "f");
    __classPrivateFieldSet(this, _Measurement_timerWaitingRef, setTimeout(function () {
        __classPrivateFieldGet(_this, _Measurement_instances, "m", _Measurement_handlePolling).call(_this, { scanId: scanId, onSuccess: onSuccess, onError: onError });
        __classPrivateFieldGet(_this, _Measurement_instances, "m", _Measurement_disconnectSocket).call(_this);
    }, 2 * 60000), "f");
};
module.exports = Measurement;
