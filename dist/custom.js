"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
class Custom {
    #accessKey;
    #stagingUrl;
    constructor(accessKey, stagingUrl = false) {
        this.#accessKey = accessKey;
        this.#stagingUrl = stagingUrl;
    }
    createCustomer(payload) {
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.CREATE_CUSTOMER}`, {
            payload,
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    ;
    getCustomCustomerConfig = (store_url) => {
        if ((0, utils_js_1.checkParameters)(store_url) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
            params: { store_url },
            headers: { "X-Api-Key": this.#accessKey },
        });
    };
    getModelUrl = (id) => {
        if ((0, utils_js_1.checkParameters)(id) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.MODEL}/${id}`, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    };
}
exports.default = Custom;
