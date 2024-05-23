"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class Custom {
    #accessKey;
    constructor(accessKey) {
        this.#accessKey = accessKey;
    }
    getCustomCustomerConfig = (store_url) => {
        if ((0, utils_1.checkParameters)(store_url) === false) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${constants_1.APP_AUTH_BASE_URL}${constants_1.API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
            params: { store_url },
            headers: { "X-Api-Key": this.#accessKey },
        });
    };
    getModelUrl = (id) => {
        if ((0, utils_1.checkParameters)(id) === false) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.get(`${constants_1.APP_AUTH_BASE_URL}${constants_1.API_ENDPOINTS.MODEL}/${id}`, { headers: { "X-Api-Key": this.#accessKey } });
    };
}
exports.default = Custom;
