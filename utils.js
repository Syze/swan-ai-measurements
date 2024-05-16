import { APP_AUTH_BASE_URL } from "./constants.js";
import axios from "axios";
export async function fetchData({
  path,
  body,
  queryParams,
  baseUrl = APP_AUTH_BASE_URL,
  apiKey = "",
  headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" },
}) {
  const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
  try {
    const res = await axios.post(apiUrl, body, { headers });
    if (res.status >= 200 && res.status < 300) {
      return res?.data;
    }
    console.error(`Error: Unexpected response status ${res?.status}`);
    return {};
  } catch (error) {
    console.error(error, "while uploading");
    return {};
  }
}

export const checkParameters = (...args) => {
  for (const element of args) {
    if (!element) {
      return false;
    }
  }
  return true;
};

export const checkMetaDataValue = (obj) => {
  for (const key of requiredMetaData) {
    if (
      !obj.hasOwnProperty(key) ||
      obj[key] === undefined ||
      obj[key] === null ||
      obj[key] === "" ||
      typeof obj[key] === "number"
    ) {
      return false;
    }
  }
  if (!obj.callback_url.startsWith("https")) {
    return false;
  }
  return true;
};
