const dotenv = require("dotenv").config().parsed;
const { FILE_UPLOAD_URL, FILE_UPLOAD_KEY } = dotenv;

const UPPY_FILE_UPLOAD_ENDPOINT = {
  UPLOAD_START: "/upload/start",
  UPLOAD_COMPLETE: "/upload/complete",
  UPLOAD_SIGN_PART: "/upload/signpart",
  UPLOAD_ABORT: "/upload/abort",
};

module.exports = { FILE_UPLOAD_URL, FILE_UPLOAD_KEY, UPPY_FILE_UPLOAD_ENDPOINT };
