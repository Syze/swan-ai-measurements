export const APP_BASE_URL: string = "https://fitview-server-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";
export const APP_AUTH_BASE_URL: string = "https://staging.api.getswan.co";
export const APP_AUTH_WEBSOCKET_URL: string = "wss://staging.wsnotify.api.getswan.co";
export const APP_TRY_ON_WEBSOCKET_URL: string = "wss://bucbzczxjk.execute-api.ap-south-1.amazonaws.com";
export const APP_RECOMMENDATION_WEBSOCKET_URL: string = "wss://staging.wsnotify.api.getswan.co/scanning";
export const APP_POSE_DETECTION_WEBSOCKET_URL: string = "https://posedetect-service-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";

export const UPPY_FILE_UPLOAD_ENDPOINT: {
  UPLOAD_START: string;
  UPLOAD_COMPLETE: string;
  UPLOAD_SIGN_PART: string;
  UPLOAD_ABORT: string;
} = {
  UPLOAD_START: "/upload/start",
  UPLOAD_COMPLETE: "/upload/complete",
  UPLOAD_SIGN_PART: "/upload/signpart",
  UPLOAD_ABORT: "/upload/abort",
};

export const API_ENDPOINTS: {
  [key: string]: string;
} = {
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
export interface ObjMetaData {
  gender: string;
  scan_id: string;
  email: string;
  focal_length: string;
  height: string;
  customer_store_url: string;
  clothes_fit: string;
  scan_type: string;
  callback_url: string;
}
type RequiredMetaDataKeys = keyof ObjMetaData;

export const requiredMetaData: RequiredMetaDataKeys[] = [
  "gender",
  "scan_id",
  "email",
  "focal_length",
  "height",
  "customer_store_url",
  "scan_type",
  "callback_url",
  "clothes_fit",
];

export const REQUIRED_MESSAGE: string = "Please verify required parameters";
export const REQUIRED_MESSAGE_FOR_META_DATA: string = "Please verify required parameters in meta data";
