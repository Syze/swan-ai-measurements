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
var _Custom_accessKey, _Custom_stagingUrl;
import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";
class Custom {
    constructor(accessKey, stagingUrl = false) {
        _Custom_accessKey.set(this, void 0);
        _Custom_stagingUrl.set(this, void 0);
        this.getCustomCustomerConfig = (store_url) => {
            if (checkParameters(store_url) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.get(`${getUrl({
                urlName: APP_AUTH_BASE_URL,
                stagingUrl: __classPrivateFieldGet(this, _Custom_stagingUrl, "f"),
            })}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
                params: { store_url },
                headers: { "X-Api-Key": __classPrivateFieldGet(this, _Custom_accessKey, "f") },
            });
        };
        this.getModelUrl = (id) => {
            if (checkParameters(id) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _Custom_stagingUrl, "f") })}${API_ENDPOINTS.MODEL}/${id}`, {
                headers: { "X-Api-Key": __classPrivateFieldGet(this, _Custom_accessKey, "f") },
            });
        };
        __classPrivateFieldSet(this, _Custom_accessKey, accessKey, "f");
        __classPrivateFieldSet(this, _Custom_stagingUrl, stagingUrl, "f");
    }
    createCustomer(payload) {
        if (checkParameters(payload.name, payload.storeUrl, payload.email, payload.location) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _Custom_stagingUrl, "f") })}${API_ENDPOINTS.CREATE_CUSTOMER}`, Object.assign(Object.assign({}, payload), { headers: { "X-Api-Key": __classPrivateFieldGet(this, _Custom_accessKey, "f") } }));
    }
}
_Custom_accessKey = new WeakMap(), _Custom_stagingUrl = new WeakMap();
export default Custom;
