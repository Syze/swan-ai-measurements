import dotenv from "dotenv";
export const { FILE_UPLOAD_URL } = dotenv.config().parsed;

export const UPPY_FILE_UPLOAD_ENDPOINT = {
  UPLOAD_START: "/upload/start",
  UPLOAD_COMPLETE: "/upload/complete",
  UPLOAD_SIGN_PART: "/upload/signpart",
  UPLOAD_ABORT: "/upload/abort",
};
