"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
class Auth {
    #socketRef;
    #accessKey;
    #stagingUrl;
    constructor(accessKey, stagingUrl = false) {
        this.#accessKey = accessKey;
        this.#stagingUrl = stagingUrl;
    }
    registerUser({ email, appVerifyUrl, gender, height, username }) {
        if (!(0, utils_js_1.checkParameters)(email, appVerifyUrl)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        let body = { username, email, appVerifyUrl };
        if (gender && height) {
            body = { ...body, attributes: { gender, height } };
        }
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.REGISTER_USER}`, body, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    verifyToken(token) {
        if (!(0, utils_js_1.checkParameters)(token)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.VERIFY_USER}`, null, {
            params: { token },
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    addUser({ scanId, email, name, height, gender, offsetMarketingConsent }) {
        if (!(0, utils_js_1.checkParameters)(scanId, email, height, gender)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.ADD_USER}`, { scan_id: scanId, email, name, offsetMarketingConsent, attributes: JSON.stringify({ height, gender }) }, { headers: { "X-Api-Key": this.#accessKey } });
    }
    getUserDetail(email) {
        if (!(0, utils_js_1.checkParameters)(email)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.GET_USER_DETAIL}/${email}`, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    handleAuthSocket({ email, scanId, onError, onSuccess, onClose, onOpen }) {
        if (!(0, utils_js_1.checkParameters)(email, scanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (this.#socketRef)
            this.#socketRef.close();
        this.#socketRef = new WebSocket(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.AUTH}`);
        const detailObj = { email, scanId };
        this.#socketRef.onopen = () => {
            this.#socketRef?.send(JSON.stringify(detailObj));
            onOpen?.();
        };
        this.#socketRef.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onSuccess?.(data);
        };
        this.#socketRef.onclose = () => {
            onClose?.();
        };
        this.#socketRef.onerror = (event) => {
            onError?.(event);
        };
    }
}
exports.default = Auth;
