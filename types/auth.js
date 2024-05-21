"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var _Auth_socketRef, _Auth_accessKey;
var axios = require("axios");
var _a = require("./constants.js"), API_ENDPOINTS = _a.API_ENDPOINTS, APP_AUTH_BASE_URL = _a.APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL = _a.APP_AUTH_WEBSOCKET_URL, APP_BASE_URL = _a.APP_BASE_URL, REQUIRED_MESSAGE = _a.REQUIRED_MESSAGE;
var checkParameters = require("./utils.js").checkParameters;
/**
 * Represents a Auth class for handling authentication operations.
 */
var Auth = /** @class */ (function () {
    /**
     * Constructs a new instance of the Auth class.
     * @param {string} accessKey - The access key used for authentication.
     */
    function Auth(accessKey) {
        var _this = this;
        _Auth_socketRef.set(this, void 0);
        /**
         * The access key used for authentication.
         * @type {string}
         * @private
         */
        _Auth_accessKey.set(this, void 0);
        /**
         * Verify a user token.
         * @param {string} token
         * @returns {Promise}
         */
        this.verifyToken = function (token, accessKey) {
            if (checkParameters(token) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.post("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.VERIFY_USER), null, {
                params: { token: token },
                headers: { "X-Api-Key": __classPrivateFieldGet(_this, _Auth_accessKey, "f") },
            });
        };
        /**
         * Add a user.
         * @param {Object} params
         * @param {string} params.scanId - The scan ID.
         * @param {string} params.email - The email of the user.
         * @param {string} params.name - The name of the user.
         * @param {string} params.height - The height of the user.
         * @param {string} params.gender - The gender of the user.
         * @param {boolean} [params.offsetMarketingConsent] - Optional. The marketing consent offset.
         * @returns {Promise} - The axios response promise.
         */
        this.addUser = function (_a) {
            var scanId = _a.scanId, email = _a.email, name = _a.name, height = _a.height, gender = _a.gender, offsetMarketingConsent = _a.offsetMarketingConsent;
            if (checkParameters(scanId, email, height, gender) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.post("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.ADD_USER), {
                scan_id: scanId,
                email: email,
                name: name,
                offsetMarketingConsent: offsetMarketingConsent,
                attributes: JSON.stringify({ height: height, gender: gender }),
            }, { headers: { "X-Api-Key": __classPrivateFieldGet(_this, _Auth_accessKey, "f") } });
        };
        /**
         * Get user details.
         * @param {string} email
         * @returns {Promise}
         */
        this.getUserDetail = function (email) {
            if (checkParameters(email) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.get("".concat(APP_BASE_URL).concat(API_ENDPOINTS.GET_USER_DETAIL, "/").concat(email), {
                headers: { "X-Api-Key": __classPrivateFieldGet(_this, _Auth_accessKey, "f") },
            });
        };
        /**
         * Handle authentication via WebSocket.
         * @param {Object} params
         * @param {string} params.email - The email address of the user.
         * @param {string} params.scanId - The scan ID associated with the user.
         * @param {function} [params.onError] - Optional. Callback function to handle errors.
         * @param {function} [params.onSuccess] - Optional. Callback function to handle successful authentication.
         * @param {function} [params.onClose] - Optional. Callback function to handle the WebSocket close event.
         * @param {function} [params.onOpen] - Optional. Callback function to handle the WebSocket open event.
         */
        this.handleAuthSocket = function (_a) {
            var _b, _c;
            var email = _a.email, scanId = _a.scanId, onError = _a.onError, onSuccess = _a.onSuccess, onClose = _a.onClose, onOpen = _a.onOpen;
            if (checkParameters(email, scanId) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            (_c = (_b = __classPrivateFieldGet(_this, _Auth_socketRef, "f")) === null || _b === void 0 ? void 0 : _b.close) === null || _c === void 0 ? void 0 : _c.call(_b);
            __classPrivateFieldSet(_this, _Auth_socketRef, new WebSocket("".concat(APP_AUTH_WEBSOCKET_URL).concat(API_ENDPOINTS.AUTH)), "f");
            var detailObj = {
                email: email,
                scanId: scanId,
            };
            __classPrivateFieldGet(_this, _Auth_socketRef, "f").onopen = function () {
                __classPrivateFieldGet(_this, _Auth_socketRef, "f").send(JSON.stringify(detailObj));
                onOpen === null || onOpen === void 0 ? void 0 : onOpen();
            };
            __classPrivateFieldGet(_this, _Auth_socketRef, "f").onmessage = function (event) {
                var data = JSON.parse(event.data);
                onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data);
            };
            __classPrivateFieldGet(_this, _Auth_socketRef, "f").onclose = function () {
                onClose === null || onClose === void 0 ? void 0 : onClose();
            };
            __classPrivateFieldGet(_this, _Auth_socketRef, "f").onerror = function (event) {
                onError === null || onError === void 0 ? void 0 : onError(event);
            };
        };
        __classPrivateFieldSet(this, _Auth_accessKey, accessKey, "f");
    }
    /**
     * Register a new user.
     * @param {Object} params - The parameters for user registration.
     * @param {string} params.email - The email of the user.
     * @param {string} params.appVerifyUrl - The verification URL.
     * @param {string} [params.gender] - Optional. The gender of the user.
     * @param {string} [params.height] - Optional. The height of the user.
     * @param {string} params.username - Optional. The username of the user.
     * @returns {Promise} - The axios response promise.
     */
    Auth.prototype.registerUser = function (_a) {
        var email = _a.email, appVerifyUrl = _a.appVerifyUrl, gender = _a.gender, height = _a.height, username = _a.username;
        if (checkParameters(email, appVerifyUrl) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        var body = {
            username: username,
            email: email,
            appVerifyUrl: appVerifyUrl,
        };
        if (gender && height) {
            body = __assign(__assign({}, body), { attributes: { gender: gender, height: height } });
        }
        return axios.post("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.REGISTER_USER), body, {
            headers: { "X-Api-Key": __classPrivateFieldGet(this, _Auth_accessKey, "f") },
        });
    };
    return Auth;
}());
_Auth_socketRef = new WeakMap(), _Auth_accessKey = new WeakMap();
module.exports = Auth;
