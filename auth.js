import axios from "axios";
import {
  API_ENDPOINTS,
  APP_AUTH_BASE_URL,
  APP_AUTH_WEBSOCKET_URL,
  APP_BASE_URL,
  REQUIRED_MESSAGE,
} from "./constants.js";
import { checkParameters } from "./utils.js";

class Auth {
  #accessKey;
  #socketRef;
  constructor(key) {
    this.#accessKey = key;
  }
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
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.REGISTER_USER}`, body);
  }

  verifyToken = (token) => {
    if (!token) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.VERIFY_USER}`, null, {
      params: { token },
    });
  };

  addUser = ({ scanId, email, name, height, gender, offsetMarketingConsent }) => {
    if (checkParameters(scanId, email, height, gender) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.ADD_USER}`, {
      scan_id: scanId,
      email,
      name,
      offsetMarketingConsent,
      attributes: JSON.stringify({ height, gender }),
    });
  };

  getUserDetail = (email) => {
    if (!email) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_BASE_URL}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`);
  };

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

export default Auth;
