const axios = require("axios");
const { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } = require("./constants.js");
const { checkParameters } = require("./utils.js");

/**
 * Represents a Custom class for handling custom operations.
 */
class Custom {
  /**
   * The access key used for authentication.
   * @type {string}
   * @private
   */
  #accessKey;
  /**
   * Constructs a new instance of the Custom class.
   * @param {string} accessKey - The access key used for authentication.
   */
  constructor(accessKey) {
    this.#accessKey = accessKey;
  }

  /**
   * Retrieves custom customer configuration based on the store URL.
   * @param {string} store_url - The URL of the store.
   * @returns {Promise} - A promise that resolves with the custom customer configuration.
   * @throws {Error} - If required parameters are missing.
   */

  getCustomCustomerConfig = (store_url) => {
    if (checkParameters(store_url) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.CUSTOM_CUSTOMER}`, {
      params: { store_url },
      headers: { "X-Api-Key": this.#accessKey },
    });
  };

  /**
   * Retrieves the model URL based on the model ID.
   * @param {string} id - The ID of the model.
   * @returns {Promise} - A promise that resolves with the model URL.
   * @throws {Error} - If required parameters are missing.
   */
  getModelUrl = (id) => {
    if (checkParameters(id) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.MODEL}/${id}`, { headers: { "X-Api-Key": this.#accessKey } });
  };
}

module.exports = Custom;
