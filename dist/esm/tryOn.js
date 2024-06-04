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
var _TryOn_instances, _TryOn_tryOnSocketRef, _TryOn_timerWaitingRef, _TryOn_accessKey, _TryOn_stagingUrl, _TryOn_getSignedUrl, _TryOn_s3Upload, _TryOn_disconnectSocket, _TryOn_handleTimeOut, _TryOn_handleGetTryOnResult;
import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";
class TryOn {
    constructor(accessKey, stagingUrl = false) {
        _TryOn_instances.add(this);
        _TryOn_tryOnSocketRef.set(this, null);
        _TryOn_timerWaitingRef.set(this, null);
        _TryOn_accessKey.set(this, void 0);
        _TryOn_stagingUrl.set(this, void 0);
        _TryOn_disconnectSocket.set(this, () => {
            var _a;
            (_a = __classPrivateFieldGet(this, _TryOn_tryOnSocketRef, "f")) === null || _a === void 0 ? void 0 : _a.close();
            if (__classPrivateFieldGet(this, _TryOn_timerWaitingRef, "f")) {
                clearTimeout(__classPrivateFieldGet(this, _TryOn_timerWaitingRef, "f"));
            }
        });
        _TryOn_handleTimeOut.set(this, ({ onSuccess, onError, shopDomain, userId, productName }) => {
            __classPrivateFieldSet(this, _TryOn_timerWaitingRef, setTimeout(() => {
                __classPrivateFieldGet(this, _TryOn_handleGetTryOnResult, "f").call(this, { shopDomain, userId, productName, onSuccess, onError });
                __classPrivateFieldGet(this, _TryOn_disconnectSocket, "f").call(this);
            }, 138000), "f");
        });
        this.handleTryOnWebSocket = ({ shopDomain, userId, productName, onError, onSuccess, onClose, onOpen }) => {
            if (checkParameters(shopDomain, userId, productName) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            __classPrivateFieldGet(this, _TryOn_disconnectSocket, "f").call(this);
            const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, stagingUrl: __classPrivateFieldGet(this, _TryOn_stagingUrl, "f") })}${API_ENDPOINTS.TRY_ON}/?store_url=${shopDomain}&product_name=${productName}&scan_id=${userId}`;
            __classPrivateFieldSet(this, _TryOn_tryOnSocketRef, new WebSocket(url), "f");
            __classPrivateFieldGet(this, _TryOn_tryOnSocketRef, "f").onopen = () => __awaiter(this, void 0, void 0, function* () {
                onOpen === null || onOpen === void 0 ? void 0 : onOpen();
                __classPrivateFieldGet(this, _TryOn_handleTimeOut, "f").call(this, { onSuccess, onError, shopDomain, userId, productName });
                try {
                    yield this.handleForLatestImage({ shopDomain, userId, productName, onError });
                }
                catch (error) {
                    onError === null || onError === void 0 ? void 0 : onError(error);
                }
            });
            __classPrivateFieldGet(this, _TryOn_tryOnSocketRef, "f").onmessage = (event) => {
                const data = JSON.parse(event.data);
                if ((data === null || data === void 0 ? void 0 : data.status) === "success") {
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
                }
                else {
                    onError === null || onError === void 0 ? void 0 : onError(data);
                }
                if (__classPrivateFieldGet(this, _TryOn_timerWaitingRef, "f")) {
                    clearTimeout(__classPrivateFieldGet(this, _TryOn_timerWaitingRef, "f"));
                }
            };
            __classPrivateFieldGet(this, _TryOn_tryOnSocketRef, "f").onclose = () => {
                onClose === null || onClose === void 0 ? void 0 : onClose();
            };
            __classPrivateFieldGet(this, _TryOn_tryOnSocketRef, "f").onerror = (event) => {
                onError === null || onError === void 0 ? void 0 : onError(event);
                if (__classPrivateFieldGet(this, _TryOn_timerWaitingRef, "f")) {
                    clearTimeout(__classPrivateFieldGet(this, _TryOn_timerWaitingRef, "f"));
                }
            };
        };
        this.handleForLatestImage = (_a) => __awaiter(this, [_a], void 0, function* ({ userId, shopDomain, productName, onError }) {
            var _b;
            if (checkParameters(shopDomain, userId, productName) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            try {
                const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _TryOn_stagingUrl, "f") })}${API_ENDPOINTS.TRY_ON}/?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
                const res = yield axios.post(url, null, {
                    headers: { "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f") },
                });
                if (((_b = res === null || res === void 0 ? void 0 : res.data) === null || _b === void 0 ? void 0 : _b.tryOnProcessStatus) === "failed") {
                    __classPrivateFieldGet(this, _TryOn_disconnectSocket, "f").call(this);
                    throw res.data;
                }
                else {
                    return res.data;
                }
            }
            catch (error) {
                onError === null || onError === void 0 ? void 0 : onError(error);
                __classPrivateFieldGet(this, _TryOn_disconnectSocket, "f").call(this);
                throw error;
            }
        });
        _TryOn_handleGetTryOnResult.set(this, (_c) => __awaiter(this, [_c], void 0, function* ({ onSuccess, onError, shopDomain, userId, productName }) {
            try {
                const data = yield this.getTryOnResult({ shopDomain, userId, productName });
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data.data);
            }
            catch (error) {
                onError === null || onError === void 0 ? void 0 : onError(error);
            }
        }));
        this.getTryOnResult = ({ userId, shopDomain, productName }) => {
            if (checkParameters(shopDomain, userId, productName) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _TryOn_stagingUrl, "f") })}${API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
            return axios.post(url, null, {
                headers: { "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f") },
            });
        };
        __classPrivateFieldSet(this, _TryOn_accessKey, accessKey, "f");
        __classPrivateFieldSet(this, _TryOn_stagingUrl, stagingUrl, "f");
    }
    uploadFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ files, userId }) {
            var _b;
            try {
                const payload = {
                    userId,
                    userImages: [(_b = files[0]) === null || _b === void 0 ? void 0 : _b.name],
                };
                if (files[1]) {
                    payload.userImages.push(files[1].name);
                }
                const signedUrlRes = yield __classPrivateFieldGet(this, _TryOn_instances, "m", _TryOn_getSignedUrl).call(this, payload);
                for (const file of files) {
                    yield __classPrivateFieldGet(this, _TryOn_instances, "m", _TryOn_s3Upload).call(this, signedUrlRes.data.uploadUrls[file.name].url, file);
                }
                return "uploaded successfully!";
            }
            catch (error) {
                throw error;
            }
        });
    }
    getUploadedFiles(userId) {
        if (checkParameters(userId) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _TryOn_stagingUrl, "f") })}${API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}?userId=${userId}`, null, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f") },
        });
    }
    deleteImage({ userId, fileName }) {
        if (checkParameters(userId, fileName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.delete(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _TryOn_stagingUrl, "f") })}${API_ENDPOINTS.TRY_ON_IMAGE_URLS}?userId=${userId}&file=${fileName}`, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _TryOn_accessKey, "f") },
        });
    }
}
_TryOn_tryOnSocketRef = new WeakMap(), _TryOn_timerWaitingRef = new WeakMap(), _TryOn_accessKey = new WeakMap(), _TryOn_stagingUrl = new WeakMap(), _TryOn_disconnectSocket = new WeakMap(), _TryOn_handleTimeOut = new WeakMap(), _TryOn_handleGetTryOnResult = new WeakMap(), _TryOn_instances = new WeakSet(), _TryOn_getSignedUrl = function _TryOn_getSignedUrl(payload) {
    return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _TryOn_stagingUrl, "f") })}${API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
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
