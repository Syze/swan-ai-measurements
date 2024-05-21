"use strict";
var APP_BASE_URL = "https://fitview-server-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";
var APP_AUTH_BASE_URL = "https://staging.api.getswan.co";
var APP_AUTH_WEBSOCKET_URL = "wss://staging.wsnotify.api.getswan.co";
var APP_TRY_ON_WEBSOCKET_URL = "wss://bucbzczxjk.execute-api.ap-south-1.amazonaws.com";
var APP_RECOMMENDATION_WEBSOCKET_URL = "wss://staging.wsnotify.api.getswan.co/scanning";
var APP_POSE_DETECTION_WEbSOCKET_URL = "https://posedetect-service-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";
var UPPY_FILE_UPLOAD_ENDPOINT = {
    UPLOAD_START: "/upload/start",
    UPLOAD_COMPLETE: "/upload/complete",
    UPLOAD_SIGN_PART: "/upload/signpart",
    UPLOAD_ABORT: "/upload/abort",
};
var API_ENDPOINTS = {
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
var requiredMetaData = ["gender", "scan_id", "email", "focal_length", "height", "customer_store_url", "scan_type", "callback_url", "clothes_fit"];
var REQUIRED_MESSAGE = "Please verify required parameters";
var REQUIRED_MESSAGE_FOR_META_DATA = "Please verify required parameters in meta data";
module.exports = {
    APP_BASE_URL: APP_BASE_URL,
    APP_AUTH_BASE_URL: APP_AUTH_BASE_URL,
    APP_AUTH_WEBSOCKET_URL: APP_AUTH_WEBSOCKET_URL,
    APP_TRY_ON_WEBSOCKET_URL: APP_TRY_ON_WEBSOCKET_URL,
    APP_RECOMMENDATION_WEBSOCKET_URL: APP_RECOMMENDATION_WEBSOCKET_URL,
    APP_POSE_DETECTION_WEbSOCKET_URL: APP_POSE_DETECTION_WEbSOCKET_URL,
    REQUIRED_MESSAGE_FOR_META_DATA: REQUIRED_MESSAGE_FOR_META_DATA,
    REQUIRED_MESSAGE: REQUIRED_MESSAGE,
    requiredMetaData: requiredMetaData,
    API_ENDPOINTS: API_ENDPOINTS,
    UPPY_FILE_UPLOAD_ENDPOINT: UPPY_FILE_UPLOAD_ENDPOINT,
};
