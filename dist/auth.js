"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Auth_socketRef, _Auth_accessKey;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class Auth {
    constructor(accessKey) {
        _Auth_socketRef.set(this, void 0);
        _Auth_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _Auth_accessKey, accessKey, "f");
    }
    registerUser({ email, appVerifyUrl, gender, height, username }) {
        if (!(0, utils_1.checkParameters)(email, appVerifyUrl)) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        let body = { username, email, appVerifyUrl };
        if (gender && height) {
            body = Object.assign(Object.assign({}, body), { attributes: { gender, height } });
        }
        return axios_1.default.post(`${constants_1.APP_AUTH_BASE_URL}${constants_1.API_ENDPOINTS.REGISTER_USER}`, body, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _Auth_accessKey, "f") },
        });
    }
    verifyToken(token) {
        if (!(0, utils_1.checkParameters)(token)) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.post(`${constants_1.APP_AUTH_BASE_URL}${constants_1.API_ENDPOINTS.VERIFY_USER}`, null, {
            params: { token },
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _Auth_accessKey, "f") },
        });
    }
    addUser({ scanId, email, name, height, gender, offsetMarketingConsent }) {
        if (!(0, utils_1.checkParameters)(scanId, email, height, gender)) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.post(`${constants_1.APP_AUTH_BASE_URL}${constants_1.API_ENDPOINTS.ADD_USER}`, { scan_id: scanId, email, name, offsetMarketingConsent, attributes: JSON.stringify({ height, gender }) }, { headers: { "X-Api-Key": __classPrivateFieldGet(this, _Auth_accessKey, "f") } });
    }
    getUserDetail(email) {
        if (!(0, utils_1.checkParameters)(email)) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${constants_1.APP_BASE_URL}${constants_1.API_ENDPOINTS.GET_USER_DETAIL}/${email}`, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _Auth_accessKey, "f") },
        });
    }
    handleAuthSocket({ email, scanId, onError, onSuccess, onClose, onOpen }) {
        if (!(0, utils_1.checkParameters)(email, scanId)) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        if (__classPrivateFieldGet(this, _Auth_socketRef, "f"))
            __classPrivateFieldGet(this, _Auth_socketRef, "f").close();
        __classPrivateFieldSet(this, _Auth_socketRef, new WebSocket(`${constants_1.APP_AUTH_WEBSOCKET_URL}${constants_1.API_ENDPOINTS.AUTH}`), "f");
        const detailObj = { email, scanId };
        __classPrivateFieldGet(this, _Auth_socketRef, "f").onopen = () => {
            var _a;
            (_a = __classPrivateFieldGet(this, _Auth_socketRef, "f")) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(detailObj));
            onOpen === null || onOpen === void 0 ? void 0 : onOpen();
        };
        __classPrivateFieldGet(this, _Auth_socketRef, "f").onmessage = (event) => {
            const data = JSON.parse(event.data);
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
        };
        __classPrivateFieldGet(this, _Auth_socketRef, "f").onclose = () => {
            onClose === null || onClose === void 0 ? void 0 : onClose();
        };
        __classPrivateFieldGet(this, _Auth_socketRef, "f").onerror = (event) => {
            onError === null || onError === void 0 ? void 0 : onError(event);
        };
    }
}
_Auth_socketRef = new WeakMap(), _Auth_accessKey = new WeakMap();
exports.default = Auth;
