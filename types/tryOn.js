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
var _TryOn_instances, _TryOn_tryOnSocketRef, _TryOn_timerWaitingRef, _TryOn_accessKey, _TryOn_getSignedUrl, _TryOn_s3Upload, _TryOn_disconnectSocket, _TryOn_handleTimeOut, _TryOn_handleGetTryOnResult;
import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";
var TryOn = /** @class */ (function () {
    /**
     * Constructs a new instance of the TryOn class.
     * @param {string} accessKey - The access key used for authentication.
     */
    function TryOn(accessKey) {
        var _this = this;
        _TryOn_instances.add(this);
        _TryOn_tryOnSocketRef.set(this, null);
        _TryOn_timerWaitingRef.set(this, null);
        _TryOn_accessKey.set(this, void 0);
        /**
         * Disconnects the WebSocket and clears the timeout.
         * @private
         */
        _TryOn_disconnectSocket.set(this, function () {
            var _a;
            (_a = __classPrivateFieldGet(_this, _TryOn_tryOnSocketRef, "f")) === null || _a === void 0 ? void 0 : _a.close();
            clearTimeout(__classPrivateFieldGet(_this, _TryOn_timerWaitingRef, "f"));
        });
        /**
         * Handles the timeout for the try-on process.
         * @param {Object} params - The parameters for the timeout handler.
         * @param {function} params.onSuccess - The success callback (optional).
         * @param {function} params.onError - The error callback (optional).
         * @param {string} params.shopDomain - The shop domain.
         * @param {string} params.userId - The user ID.
         * @param {string} params.productName - The product name.
         * @private
         */
        _TryOn_handleTimeOut.set(this, function (_a) {
            var onSuccess = _a.onSuccess, onError = _a.onError, shopDomain = _a.shopDomain, userId = _a.userId, productName = _a.productName;
            __classPrivateFieldSet(_this, _TryOn_timerWaitingRef, setTimeout(function () {
                __classPrivateFieldGet(_this, _TryOn_handleGetTryOnResult, "f").call(_this, { shopDomain: shopDomain, userId: userId, productName: productName, onSuccess: onSuccess, onError: onError });
                __classPrivateFieldGet(_this, _TryOn_disconnectSocket, "f").call(_this);
            }, 120000), "f");
        });
        /**
         * Handles the WebSocket connection for the try-on process.
         * @param {Object} params - The parameters for the WebSocket handler.
         * @param {string} params.shopDomain - The shop domain.
         * @param {string} params.userId - The user ID.
         * @param {string} params.productName - The product name.
         * @param {function} [params.onError] - The error callback (optional).
         * @param {function} [params.onSuccess] - The success callback (optional).
         * @param {function} [params.onClose] - The close callback (optional).
         * @param {function} [params.onOpen] - The open callback (optional).
         * @throws {Error} - If the required parameters are missing.
         */
        this.handleTryOnWebSocket = function (_a) {
            var shopDomain = _a.shopDomain, userId = _a.userId, productName = _a.productName, onError = _a.onError, onSuccess = _a.onSuccess, onClose = _a.onClose, onOpen = _a.onOpen;
            if (checkParameters(shopDomain, userId, productName) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            __classPrivateFieldGet(_this, _TryOn_disconnectSocket, "f").call(_this);
            var url = "".concat(APP_AUTH_WEBSOCKET_URL).concat(API_ENDPOINTS.TRY_ON, "/?store_url=").concat(shopDomain, "&product_name=").concat(productName, "&scan_id=").concat(userId);
            __classPrivateFieldSet(_this, _TryOn_tryOnSocketRef, new WebSocket(url), "f");
            __classPrivateFieldGet(_this, _TryOn_tryOnSocketRef, "f").onopen = function () { return __awaiter(_this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            onOpen === null || onOpen === void 0 ? void 0 : onOpen();
                            __classPrivateFieldGet(this, _TryOn_handleTimeOut, "f").call(this, { onSuccess: onSuccess, onError: onError, shopDomain: shopDomain, userId: userId, productName: productName });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.handleForLatestImage({ shopDomain: shopDomain, userId: userId, productName: productName })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            onError === null || onError === void 0 ? void 0 : onError(error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); };
            __classPrivateFieldGet(_this, _TryOn_tryOnSocketRef, "f").onmessage = function (event) {
                var data = JSON.parse(event.data);
                if ((data === null || data === void 0 ? void 0 : data.status) === "success") {
                    __classPrivateFieldGet(_this, _TryOn_handleGetTryOnResult, "f").call(_this, { shopDomain: shopDomain, userId: userId, productName: productName, onError: onError, onSuccess: onSuccess });
                }
                else {
                    onError === null || onError === void 0 ? void 0 : onError(data);
                }
                clearTimeout(__classPrivateFieldGet(_this, _TryOn_timerWaitingRef, "f"));
            };
            __classPrivateFieldGet(_this, _TryOn_tryOnSocketRef, "f").onclose = function () {
                onClose === null || onClose === void 0 ? void 0 : onClose();
            };
            __classPrivateFieldGet(_this, _TryOn_tryOnSocketRef, "f").onerror = function (event) {
                onError === null || onError === void 0 ? void 0 : onError(event);
                clearTimeout(__classPrivateFieldGet(_this, _TryOn_timerWaitingRef, "f"));
            };
        };
        /**
         * Handles getting the latest image for the try-on process.
         * @param {Object} params - The parameters for getting the latest image.
         * @param {string} params.userId - The user ID.
         * @param {string} params.shopDomain - The shop domain.
         * @param {string} params.productName - The product name.
         * @param {function} params.onError - The error callback (optional).
         * @returns {Promise<Object>} - A promise that resolves with the latest image data.
         * @throws {Error} - If the parameters are invalid.
         */
        this.handleForLatestImage = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var _this = this;
            var userId = _b.userId, shopDomain = _b.shopDomain, productName = _b.productName, onError = _b.onError;
            return __generator(this, function (_c) {
                if (checkParameters(shopDomain, userId, productName) === false) {
                    throw new Error(REQUIRED_MESSAGE);
                }
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var url, res, error_2;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    url = "".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.TRY_ON, "/?scan_id=").concat(userId, "&store_url=").concat(shopDomain, "&product_name=").concat(productName);
                                    return [4 /*yield*/, axios.post(url, {
                                            headers: { "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f") },
                                        })];
                                case 1:
                                    res = _b.sent();
                                    if (((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.tryOnProcessStatus) === "failed") {
                                        __classPrivateFieldGet(this, _TryOn_disconnectSocket, "f").call(this);
                                        reject(res === null || res === void 0 ? void 0 : res.data);
                                    }
                                    else {
                                        resolve(res === null || res === void 0 ? void 0 : res.data);
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _b.sent();
                                    onError === null || onError === void 0 ? void 0 : onError(error_2);
                                    __classPrivateFieldGet(this, _TryOn_disconnectSocket, "f").call(this);
                                    reject(error_2);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        }); };
        /**
         * Handles the result of the try-on process.
         * @param {Object} params - The parameters for handling the try-on result.
         * @param {function} params.onSuccess - The success callback.
         * @param {function} params.onError - The error callback.
         * @param {string} params.shopDomain - The shop domain.
         * @param {string} params.userId - The user ID.
         * @param {string} params.productName - The product name.
         * @private
         */
        _TryOn_handleGetTryOnResult.set(this, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var data, error_3;
            var onSuccess = _b.onSuccess, onError = _b.onError, shopDomain = _b.shopDomain, userId = _b.userId, productName = _b.productName;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getTryOnResult({ shopDomain: shopDomain, userId: userId, productName: productName })];
                    case 1:
                        data = _c.sent();
                        onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data === null || data === void 0 ? void 0 : data.data);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _c.sent();
                        onError === null || onError === void 0 ? void 0 : onError(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        /**
         * Retrieves the try-on result.
         * @param {Object} params - The parameters for fetching the try-on result.
         * @param {string} params.userId - The user ID.
         * @param {string} params.shopDomain - The shop domain.
         * @param {string} params.productName - The product name.
         * @returns {Promise} - The axios response promise.
         * @throws {Error} - If the required parameters are missing.
         */
        this.getTryOnResult = function (_a) {
            var userId = _a.userId, shopDomain = _a.shopDomain, productName = _a.productName;
            if (checkParameters(shopDomain, userId, productName) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            var url = "".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD, "?scan_id=").concat(userId, "&store_url=").concat(shopDomain, "&product_name=").concat(productName);
            return axios.post(url, null, {
                headers: { "X-Api-Key": __classPrivateFieldGet(_this, _TryOn_accessKey, "f") },
            });
        };
        __classPrivateFieldSet(this, _TryOn_accessKey, accessKey, "f");
    }
    /**
     * Uploads files to the server.
     * @param {Object} params - The parameters for uploading the files.
     * @param {File[]} params.files - The files to be uploaded.
     * @param {string} params.userId - The user ID.
     * @returns {Promise<string>} - A promise that resolves with a success message.
     */
    TryOn.prototype.uploadFile = function (_a) {
        var _this = this;
        var files = _a.files, userId = _a.userId;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var payload, signedUrlRes, _i, files_1, file, error_4;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 6, , 7]);
                        payload = {
                            userId: userId,
                            userImages: [(_a = files === null || files === void 0 ? void 0 : files[0]) === null || _a === void 0 ? void 0 : _a.name],
                        };
                        if (files === null || files === void 0 ? void 0 : files[1]) {
                            payload.userImages.push((_b = files === null || files === void 0 ? void 0 : files[1]) === null || _b === void 0 ? void 0 : _b.name);
                        }
                        return [4 /*yield*/, __classPrivateFieldGet(this, _TryOn_instances, "m", _TryOn_getSignedUrl).call(this, payload)];
                    case 1:
                        signedUrlRes = _f.sent();
                        _i = 0, files_1 = files;
                        _f.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 5];
                        file = files_1[_i];
                        return [4 /*yield*/, __classPrivateFieldGet(this, _TryOn_instances, "m", _TryOn_s3Upload).call(this, (_e = (_d = (_c = signedUrlRes === null || signedUrlRes === void 0 ? void 0 : signedUrlRes.data) === null || _c === void 0 ? void 0 : _c.uploadUrls) === null || _d === void 0 ? void 0 : _d[file.name]) === null || _e === void 0 ? void 0 : _e.url, file)];
                    case 3:
                        _f.sent();
                        _f.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        resolve("uploaded successfully!");
                        return [3 /*break*/, 7];
                    case 6:
                        error_4 = _f.sent();
                        reject(error_4);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Retrieves uploaded files for a user.
     * @param {string} userId - The user ID.
     * @returns {Promise<Object>} - A promise that resolves with the uploaded files response.
     * @throws {Error} - If the parameters are invalid.
     */
    TryOn.prototype.getUploadedFiles = function (userId) {
        if (checkParameters(userId) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.post("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD, "?userId=").concat(userId), null, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f") },
        });
    };
    /**
     * Deletes an uploaded image for a user.
     * @param {Object} params - The parameters for deleting the image.
     * @param {string} params.userId - The user ID.
     * @param {string} params.fileName - The name of the file to be deleted.
     * @returns {Promise<Object>} - A promise that resolves with the delete response.
     * @throws {Error} - If the parameters are invalid.
     */
    TryOn.prototype.deleteImage = function (_a) {
        var userId = _a.userId, fileName = _a.fileName;
        if (checkParameters(userId, fileName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.delete("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.TRY_ON_IMAGE_URLS, "?userId=").concat(userId, "&file=").concat(fileName), {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f") },
        });
    };
    return TryOn;
}());
_TryOn_tryOnSocketRef = new WeakMap(), _TryOn_timerWaitingRef = new WeakMap(), _TryOn_accessKey = new WeakMap(), _TryOn_disconnectSocket = new WeakMap(), _TryOn_handleTimeOut = new WeakMap(), _TryOn_handleGetTryOnResult = new WeakMap(), _TryOn_instances = new WeakSet(), _TryOn_getSignedUrl = function _TryOn_getSignedUrl(payload) {
    return axios.post("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD), payload, {
        headers: {
            "Content-Type": "application/json",
            "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f"),
        },
    });
}, _TryOn_s3Upload = function _TryOn_s3Upload(url, file) {
    return axios.put(url, file, {
        headers: {
            "Content-Type": file.type,
        },
    });
};
export default TryOn;
