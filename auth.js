import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_URL } from "./constants.js";

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

export function verifyUser(token, accessKey) {
  return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.VERIFY_USER}`, null, {
    params: { token },
  });
}

export const addUser = async ({ scanId, email, name = "", height, gender, accessKey }) =>
  axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.ADD_USER}`, {
    scan_id: scanId,
    email,
    name,
    attributes: JSON.stringify({ height, gender }),
  });

export function getUserDetail(email, accessKey) {
  return axios.get(`${APP_BASE_URL}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`);
}
