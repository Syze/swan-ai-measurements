"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
const enum_js_1 = require("./enum.js");
class Custom {
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
    createCustomer(payload) {
        if ((0, utils_js_1.checkParameters)(payload.name, payload.storeUrl, payload.email, payload.location) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.CREATE_CUSTOMER}`, payload, {
            headers: this.#getHeaders(),
        });
    }
    getCustomCustomerConfig = (store_url) => {
        if ((0, utils_js_1.checkParameters)(store_url) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({
            urlName: constants_js_1.APP_AUTH_BASE_URL,
            urlType: this.#urlType,
        })}${constants_js_1.API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
            params: { store_url },
            headers: this.#getHeaders(),
        });
    };
    getModelUrl = (id) => {
        if ((0, utils_js_1.checkParameters)(id) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, urlType: this.#urlType })}${constants_js_1.API_ENDPOINTS.MODEL}/${id}`, {
            headers: this.#getHeaders(),
        });
    };
}
exports.default = Custom;
