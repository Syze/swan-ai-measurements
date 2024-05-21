const axios = require("axios");
const { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, APP_BASE_URL, REQUIRED_MESSAGE } = require("./constants.js");
const { checkParameters } = require("./utils.js");

/**
 * Represents a Auth class for handling authentication operations.
 */
class Auth {
  #socketRef;

  /**
   * The access key used for authentication.
   * @type {string}
   * @private
   */
  #accessKey;

  /**
   * Constructs a new instance of the Auth class.
   * @param {string} accessKey - The access key used for authentication.
   */
  constructor(accessKey) {
    this.#accessKey = accessKey;
  }
  /**
   * Register a new user.
   * @param {Object} params - The parameters for user registration.
   * @param {string} params.email - The email of the user.
   * @param {string} params.appVerifyUrl - The verification URL.
   * @param {string} [params.gender] - Optional. The gender of the user.
   * @param {string} [params.height] - Optional. The height of the user.
   * @param {string} params.username - Optional. The username of the user.
   * @returns {Promise} - The axios response promise.
   */
  registerUser({ email, appVerifyUrl, gender, height, username }) {
    if (checkParameters(email, appVerifyUrl) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    let body = {
      username,
      email,
      appVerifyUrl,
    };
    if (gender && height) {
      body = { ...body, attributes: { gender, height } };
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.REGISTER_USER}`, body, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  /**
   * Verify a user token.
   * @param {string} token
   * @returns {Promise}
   */

  verifyToken = (token, accessKey) => {
    if (checkParameters(token) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.VERIFY_USER}`, null, {
      params: { token },
      headers: { "X-Api-Key": this.#accessKey },
    });
  };

  /**
   * Add a user.
   * @param {Object} params
   * @param {string} params.scanId - The scan ID.
   * @param {string} params.email - The email of the user.
   * @param {string} params.name - The name of the user.
   * @param {string} params.height - The height of the user.
   * @param {string} params.gender - The gender of the user.
   * @param {boolean} [params.offsetMarketingConsent] - Optional. The marketing consent offset.
   * @returns {Promise} - The axios response promise.
   */

  addUser = ({ scanId, email, name, height, gender, offsetMarketingConsent }) => {
    if (checkParameters(scanId, email, height, gender) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(
      `${APP_AUTH_BASE_URL}${API_ENDPOINTS.ADD_USER}`,
      {
        scan_id: scanId,
        email,
        name,
        offsetMarketingConsent,
        attributes: JSON.stringify({ height, gender }),
      },
      { headers: { "X-Api-Key": this.#accessKey } }
    );
  };

  /**
   * Get user details.
   * @param {string} email
   * @returns {Promise}
   */

  getUserDetail = (email) => {
    if (checkParameters(email) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_BASE_URL}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  };
  /**
   * Handle authentication via WebSocket.
   * @param {Object} params
   * @param {string} params.email - The email address of the user.
   * @param {string} params.scanId - The scan ID associated with the user.
   * @param {function} [params.onError] - Optional. Callback function to handle errors.
   * @param {function} [params.onSuccess] - Optional. Callback function to handle successful authentication.
   * @param {function} [params.onClose] - Optional. Callback function to handle the WebSocket close event.
   * @param {function} [params.onOpen] - Optional. Callback function to handle the WebSocket open event.
   */
  handleAuthSocket = ({ email, scanId, onError, onSuccess, onClose, onOpen }) => {
    if (checkParameters(email, scanId) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    this.#socketRef?.close?.();

    this.#socketRef = new WebSocket(`${APP_AUTH_WEBSOCKET_URL}${API_ENDPOINTS.AUTH}`);
    const detailObj = {
      email,
      scanId,
    };

    this.#socketRef.onopen = () => {
      this.#socketRef.send(JSON.stringify(detailObj));
      onOpen?.();
    };

    this.#socketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onSuccess?.(data);
    };

    this.#socketRef.onclose = () => {
      onClose?.();
    };

    this.#socketRef.onerror = (event) => {
      onError?.(event);
    };
  };
}

module.exports = Auth;
