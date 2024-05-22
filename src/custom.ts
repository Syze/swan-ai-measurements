import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants";
import { checkParameters } from "./utils";

class Custom {
  #accessKey: string;

  constructor(accessKey: string) {
    this.#accessKey = accessKey;
  }

  getCustomCustomerConfig: (store_url: string) => Promise<AxiosResponse<any>> = (store_url: string) => {
    if (checkParameters(store_url) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
      params: { store_url },
      headers: { "X-Api-Key": this.#accessKey },
    });
  };

  getModelUrl: (id: string) => Promise<AxiosResponse<any>> = (id: string) => {
    if (checkParameters(id) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.MODEL}/${id}`, { headers: { "X-Api-Key": this.#accessKey } });
  };
}

export default Custom;
