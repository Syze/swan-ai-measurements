const axios = require("axios");
const { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, APP_BASE_URL, REQUIRED_MESSAGE } = require("./constants.js");
const { checkParameters } = require("./utils.js");

class Auth {
  #socketRef;

  registerUser({ email, appVerifyUrl, gender, height, username, accessKey }) {
    if (checkParameters(email, appVerifyUrl, accessKey) === false) {
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
      headers: { "X-Api-Key": accessKey },
    });
  }

  verifyToken = (token, accessKey) => {
    if (checkParameters(token, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.VERIFY_USER}`, null, {
      params: { token },
      headers: { "X-Api-Key": accessKey },
    });
  };

  addUser = ({ scanId, email, name, height, gender, offsetMarketingConsent, accessKey }) => {
    if (checkParameters(scanId, email, height, gender, accessKey) === false) {
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
      { headers: { "X-Api-Key": accessKey } }
    );
  };

  getUserDetail = (email, accessKey) => {
    if (checkParameters(email, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_BASE_URL}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`, {
      headers: { "X-Api-Key": accessKey },
    });
  };

  handleAuthSocket = ({ email, scanId, onError, onSuccess, onClose, onOpen, accessKey }) => {
    if (checkParameters(email, scanId, accessKey) === false) {
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
