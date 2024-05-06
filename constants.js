export const FILE_UPLOAD_KEY = "7a8ccc86249849be911b0d7dbc20290e";
export const APP_BASE_URL = "https://fitview-server-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";
export const APP_AUTH_BASE_URL = "https://staging.api.getswan.co";
export const APP_AUTH_WEBSOCKET_URL = "wss://staging.wsnotify.api.getswan.co";
export const APP_TRY_ON_WEBSOCKET_URL = "wss://bucbzczxjk.execute-api.ap-south-1.amazonaws.com";
export const APP_RECOMMENDATION_WEBSOCKET_URL = "wss://staging.wsnotify.api.getswan.co/scanning";
export const APP_POSE_DETECTION_WEbSOCKET_URL =
  "https://posedetect-service-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";

export const UPPY_FILE_UPLOAD_ENDPOINT = {
  UPLOAD_START: "/upload/start",
  UPLOAD_COMPLETE: "/upload/complete",
  UPLOAD_SIGN_PART: "/upload/signpart",
  UPLOAD_ABORT: "/upload/abort",
};

export const API_ENDPOINTS = {
  GET_USER_DETAIL: "/api/user",
  REGISTER_USER: "/auth/register",
  VERIFY_USER: "/auth/verify",
  ADD_USER: "/user",
  CUSTOM_CUSTOMER: "/customers/custom",
  MODEL: "/model",
  TRY_ON_SCAN: "/tryon/scan",
  TRY_ON_IMAGE_UPLOAD: "/tryon/user-image-urls/upload",
  TRY_ON_IMAGE_DOWNLOAD: "/tryon/user-image-urls/download",
  TRY_ON_IMAGE_URLS: "/tryon/user-image-urls",
  TRY_ON_RESULT_IMAGE_DOWNLOAD: "/tryon/result-image-urls/download",
  TRY_ON: "/tryon",
  AUTH: "/auth",
};

export const REQUIRED_MESSAGE = "Please verify required parameters";
