import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, APP_BASE_URL } from "./constants.js";
let socketRef;
export const registerUser = ({ email, appVerifyUrl, gender, height, username = "", accessKey }) => {
  let body = {
    username,
    email,
    appVerifyUrl,
  };
  if (gender && height) {
    body = { ...body, attributes: { gender, height } };
  }
  return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.REGISTER_USER}`, body);
};

export const verifyToken = (token, accessKey) =>
  axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.VERIFY_USER}`, null, {
    params: { token },
  });

export const addUser = ({ scanId, email, name, height, gender, accessKey, offsetMarketingConsent }) =>
  axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.ADD_USER}`, {
    scan_id: scanId,
    email,
    name,
    offsetMarketingConsent,
    attributes: JSON.stringify({ height, gender }),
  });

export const getUserDetail = (email, accessKey) =>
  axios.get(`${APP_BASE_URL}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`);

export const handleAuthSocket = ({
  email,
  scanId,
  accessKey,
  failedCallBack,
  successCallBack,
  closeCallBack,
  openCallBack,
}) => {
  if (socketRef) {
    socketRef.close();
  }
  return new Promise((resolve, reject) => {
    const socketRef = new WebSocket(APP_AUTH_WEBSOCKET_URL);
    const detailObj = {
      email,
      scanId,
    };
    socketRef.onopen = () => {
      openCallBack();
      socketRef.send(JSON.stringify(detailObj));
    };
    socketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      successCallBack(data);
    };
    socketRef.onclose = () => {
      closeCallBack();
    };
    socketRef.current.onerror = (event) => {
      failedCallBack(event);
    };
  });
};
