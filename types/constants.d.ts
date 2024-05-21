export const APP_BASE_URL: "https://fitview-server-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";
export const APP_AUTH_BASE_URL: "https://staging.api.getswan.co";
export const APP_AUTH_WEBSOCKET_URL: "wss://staging.wsnotify.api.getswan.co";
export const APP_TRY_ON_WEBSOCKET_URL: "wss://bucbzczxjk.execute-api.ap-south-1.amazonaws.com";
export const APP_RECOMMENDATION_WEBSOCKET_URL: "wss://staging.wsnotify.api.getswan.co/scanning";
export const APP_POSE_DETECTION_WEbSOCKET_URL: "https://posedetect-service-staging.ft2a64raup4pg.us-east-1.cs.amazonlightsail.com";
export const REQUIRED_MESSAGE_FOR_META_DATA: "Please verify required parameters in meta data";
export const REQUIRED_MESSAGE: "Please verify required parameters";
export const requiredMetaData: string[];
export namespace API_ENDPOINTS {
    let GET_USER_DETAIL: string;
    let REGISTER_USER: string;
    let VERIFY_USER: string;
    let ADD_USER: string;
    let CUSTOM_CUSTOMER: string;
    let MODEL: string;
    let TRY_ON_SCAN: string;
    let TRY_ON_IMAGE_UPLOAD: string;
    let TRY_ON_IMAGE_DOWNLOAD: string;
    let TRY_ON_IMAGE_URLS: string;
    let TRY_ON_RESULT_IMAGE_DOWNLOAD: string;
    let TRY_ON: string;
    let AUTH: string;
}
export namespace UPPY_FILE_UPLOAD_ENDPOINT {
    let UPLOAD_START: string;
    let UPLOAD_COMPLETE: string;
    let UPLOAD_SIGN_PART: string;
    let UPLOAD_ABORT: string;
}
