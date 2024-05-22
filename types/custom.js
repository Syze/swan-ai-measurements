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
var _Custom_accessKey;
import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";
/**
 * Represents a Custom class for handling custom operations.
 */
var Custom = /** @class */ (function () {
    /**
     * Constructs a new instance of the Custom class.
     * @param {string} accessKey - The access key used for authentication.
     */
    function Custom(accessKey) {
        var _this = this;
        /**
         * The access key used for authentication.
         * @type {string}
         * @private
         */
        _Custom_accessKey.set(this, void 0);
        /**
         * Retrieves custom customer configuration based on the store URL.
         * @param {string} store_url - The URL of the store.
         * @returns {Promise} - A promise that resolves with the custom customer configuration.
         * @throws {Error} - If required parameters are missing.
         */
        this.getCustomCustomerConfig = function (store_url) {
            if (checkParameters(store_url) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.get("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.CUSTOM_CUSTOMER), {
                params: { store_url: store_url },
                headers: { "X-Api-Key": __classPrivateFieldGet(_this, _Custom_accessKey, "f") },
            });
        };
        /**
         * Retrieves the model URL based on the model ID.
         * @param {string} id - The ID of the model.
         * @returns {Promise} - A promise that resolves with the model URL.
         * @throws {Error} - If required parameters are missing.
         */
        this.getModelUrl = function (id) {
            if (checkParameters(id) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.get("".concat(APP_AUTH_BASE_URL).concat(API_ENDPOINTS.MODEL, "/").concat(id), { headers: { "X-Api-Key": __classPrivateFieldGet(_this, _Custom_accessKey, "f") } });
        };
        __classPrivateFieldSet(this, _Custom_accessKey, accessKey, "f");
    }
    return Custom;
}());
_Custom_accessKey = new WeakMap();
export default Custom;
