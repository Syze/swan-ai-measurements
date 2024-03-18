import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL } from "./constants.js";

export const getCustomCustomerConfig = (store_url, accessKey) =>
  axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, { params: { store_url } });

export const getModelUrl = (id, accessKey) => axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.MODEL}/${id}`);
