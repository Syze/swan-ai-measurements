import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";

interface CreateCustomer {
  name: string;
  storeUrl: string;
  location: string;
  email: string;
  emailsTier_1?: string;
  emailsTier_2?: string;
}
class Custom {
  #accessKey: string;
  #stagingUrl: boolean;
  constructor(accessKey: string, stagingUrl = false) {
    this.#accessKey = accessKey;
    this.#stagingUrl = stagingUrl;
  }

  createCustomer(payload: CreateCustomer): Promise<AxiosResponse<any>> {
    if (checkParameters(payload.name, payload.storeUrl, payload.email, payload.location)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.CREATE_CUSTOMER}`, {
      ...payload,
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  getCustomCustomerConfig: (store_url: string) => Promise<AxiosResponse<any>> = (store_url: string) => {
    if (checkParameters(store_url) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(
      `${getUrl({
        urlName: APP_AUTH_BASE_URL,
        stagingUrl: this.#stagingUrl,
      })}${API_ENDPOINTS.CUSTOM_CUSTOMER}`,
      {
        params: { store_url },
        headers: { "X-Api-Key": this.#accessKey },
      }
    );
  };

  getModelUrl: (id: string) => Promise<AxiosResponse<any>> = (id: string) => {
    if (checkParameters(id) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.MODEL}/${id}`, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  };
}

export default Custom;
