export const STAGING_URL = {
    APP_AUTH_BASE_URL: "https://staging.api.swanvision.ai/",
    APP_BASE_WEBSOCKET_URL: "wss://staging.wsnotify.api.getswan.co",
    APP_POSE_DETECTION_WEBSOCKET_URL: "https://posedetect-service-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com",
};
export const PROD_URL = {
    APP_AUTH_BASE_URL: "https://api.swanvision.ai",
    APP_BASE_WEBSOCKET_URL: "wss://wsnotify.api.getswan.co",
    APP_POSE_DETECTION_WEBSOCKET_URL: "https://posedetect-service.uvcn97hn133d6.eu-west-1.cs.amazonlightsail.com",
};
export const FILE_UPLOAD_ENDPOINT = {
    UPLOAD_START: "/upload/start",
    UPLOAD_COMPLETE: "/upload/complete",
    UPLOAD_SIGN_PART: "/upload/signpart",
    UPLOAD_ABORT: "/upload/abort",
};
export const APP_AUTH_BASE_URL = "APP_AUTH_BASE_URL";
export const APP_BASE_WEBSOCKET_URL = "APP_BASE_WEBSOCKET_URL";
export const APP_POSE_DETECTION_WEBSOCKET_URL = "APP_POSE_DETECTION_WEBSOCKET_URL";
export const API_ENDPOINTS = {
    GET_USER_DETAIL: "/api/user",
    REGISTER_USER: "/auth/register",
    VERIFY_USER: "/auth/verify",
    ADD_USER: "/user",
    CUSTOM_CUSTOMER: "/customers/custom",
    CREATE_CUSTOMER: "/customers",
    MODEL: "/model",
    TRY_ON_SCAN: "/tryon/scan",
    TRY_ON_IMAGE_UPLOAD: "/tryon/user-image-urls/upload",
    TRY_ON_IMAGE_DOWNLOAD: "/tryon/user-image-urls/download",
    TRY_ON_IMAGE_URLS: "/tryon/user-image-urls",
    TRY_ON_RESULT_IMAGE_DOWNLOAD: "/tryon/result-image-urls/download",
    TRY_ON: "/tryon",
    AUTH: "/auth",
    SCANNING: "/scanning",
};
export const requiredMetaData = [
    "gender",
    "email",
    "focal_length",
    "height",
    "customer_store_url",
    "callback_url",
    "clothes_fit",
];
export const REQUIRED_MESSAGE = "Please verify required parameters";
export const REQUIRED_MESSAGE_FOR_META_DATA = "Please verify required parameters in meta data";
