import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";
class Custom {
    #accessKey;
    constructor(accessKey) {
        this.#accessKey = accessKey;
    }
    getCustomCustomerConfig = (store_url) => {
        if (checkParameters(store_url) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
            params: { store_url },
            headers: { "X-Api-Key": this.#accessKey },
        });
    };
    getModelUrl = (id) => {
        if (checkParameters(id) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.MODEL}/${id}`, { headers: { "X-Api-Key": this.#accessKey } });
    };
}
export default Custom;
