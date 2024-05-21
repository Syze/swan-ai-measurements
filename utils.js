const { APP_AUTH_BASE_URL, requiredMetaData } = require("./constants.js");
const axios = require("axios");
async function fetchData({
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

const checkParameters = (...args) => {
  for (const element of args) {
    if (!element) {
      return false;
    }
  }
  return true;
};

const checkMetaDataValue = (arr) => {
  for (const key of requiredMetaData) {
    let hasRequiredKey = false;
    inner: for (const obj of arr) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null && obj[key] !== "" && typeof obj[key] !== "number") {
        hasRequiredKey = true;
        break inner;
      }
    }
    if (!hasRequiredKey) {
      return false;
    }
  }
  let correctFormat = false;
  for (const obj of arr) {
    if (obj.callback_url && obj.callback_url.startsWith("https")) {
      correctFormat = true;
    }
  }
  if (!correctFormat) {
    return false;
  }
  return true;
};

module.exports = { checkMetaDataValue, checkParameters, fetchData };
