import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants.js";

export default class Custom {
  static accessKey;
  constructor(key) {
    Custom.accessKey = key;
  }
  getCustomCustomerConfig = (store_url) => {
    if (!store_url) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, { params: { store_url } });
  };

  getModelUrl = (id) => {
    if (!id) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.MODEL}/${id}`);
  };
}
