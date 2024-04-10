import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, APP_BASE_URL } from "./constants.js";
let socketRef;

class Auth {
  registerUser({ email, appVerifyUrl, gender, height, username, accessKey }) {
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

  verifyToken = (token, accessKey) =>
    axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.VERIFY_USER}`, null, {
      params: { token },
    });

  addUser = ({ scanId, email, name, height, gender, accessKey, offsetMarketingConsent }) =>
    axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.ADD_USER}`, {
      scan_id: scanId,
      email,
      name,
      offsetMarketingConsent,
      attributes: JSON.stringify({ height, gender }),
    });

  getUserDetail = (email, accessKey) => axios.get(`${APP_BASE_URL}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`);

  handleAuthSocket = ({ email, scanId, accessKey, onError, onSuccess, onClose, onOpen }) => {
    socketRef?.close?.();

    socketRef = new WebSocket(APP_AUTH_WEBSOCKET_URL);
    const detailObj = {
      email,
      scanId,
    };

    socketRef.onopen = () => {
      onOpen?.();
      socketRef.send(JSON.stringify(detailObj));
    };

    socketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onSuccess?.(data);
    };

    socketRef.onclose = () => {
      onClose?.();
    };

    socketRef.onerror = (event) => {
      onError?.(event);
    };
  };
}

export default Auth;
