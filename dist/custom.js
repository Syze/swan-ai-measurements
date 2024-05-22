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
var _Custom_accessKey;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class Custom {
    constructor(accessKey) {
        _Custom_accessKey.set(this, void 0);
        this.getCustomCustomerConfig = (store_url) => {
            if ((0, utils_1.checkParameters)(store_url) === false) {
                throw new Error(constants_1.REQUIRED_MESSAGE);
            }
            return axios_1.default.get(`${constants_1.APP_AUTH_BASE_URL}${constants_1.API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
                params: { store_url },
                headers: { "X-Api-Key": __classPrivateFieldGet(this, _Custom_accessKey, "f") },
            });
        };
        this.getModelUrl = (id) => {
            if ((0, utils_1.checkParameters)(id) === false) {
                throw new Error(constants_1.REQUIRED_MESSAGE);
            }
            return axios_1.default.get(`${constants_1.APP_AUTH_BASE_URL}${constants_1.API_ENDPOINTS.MODEL}/${id}`, { headers: { "X-Api-Key": __classPrivateFieldGet(this, _Custom_accessKey, "f") } });
        };
        __classPrivateFieldSet(this, _Custom_accessKey, accessKey, "f");
    }
}
_Custom_accessKey = new WeakMap();
exports.default = Custom;
