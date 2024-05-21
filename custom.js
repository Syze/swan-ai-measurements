const axios = require("axios");
const { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } = require("./constants.js");
const { checkParameters } = require("./utils.js");

class Custom {
  getCustomCustomerConfig = (store_url, accessKey) => {
    if (checkParameters(store_url, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
      params: { store_url },
      headers: { "X-Api-Key": accessKey },
    });
  };

  getModelUrl = (id, accessKey) => {
    if (checkParameters(id, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.MODEL}/${id}`, { headers: { "X-Api-Key": accessKey } });
  };
}

module.exports = Custom;
