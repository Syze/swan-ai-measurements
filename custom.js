import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL } from "./constants.js";

export default class Custom {
  static accessKey;
  constructor(key) {
    Custom.accessKey = key;
  }
  getCustomCustomerConfig = (store_url) =>
    axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, { params: { store_url } });

  getModelUrl = (id) => axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.MODEL}/${id}`);
}
