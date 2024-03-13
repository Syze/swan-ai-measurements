const axios = require("axios");
const { FILE_UPLOAD_URL } = require("./constants");

async function fetchData({
  path,
  body,
  queryParams,
  baseUrl = FILE_UPLOAD_URL,
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

module.exports = { fetchData };
