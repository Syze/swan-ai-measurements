export declare const STAGING_URL: Record<string, string>;
export declare const PROD_URL: Record<string, string>;
export declare const DEV_URL: Record<string, string>;
export declare const URLS: Record<string, Record<string, string>>;
export declare const FILE_UPLOAD_ENDPOINT: {
    UPLOAD_START: string;
    UPLOAD_COMPLETE: string;
    UPLOAD_SIGN_PART: string;
    UPLOAD_ABORT: string;
};
export declare const APP_AUTH_BASE_URL = "APP_AUTH_BASE_URL";
export declare const APP_BASE_WEBSOCKET_URL = "APP_BASE_WEBSOCKET_URL";
export declare const APP_POSE_DETECTION_WEBSOCKET_URL = "APP_POSE_DETECTION_WEBSOCKET_URL";
export declare const API_ENDPOINTS: {
    [key: string]: string;
};
export interface BodyScanObjMetaData {
    gender: string;
    scan_id?: string;
    email: string;
    focal_length: string;
    height: string;
    customer_store_url: string;
    clothes_fit: string;
    scan_type?: string;
    callback_url?: string;
}
export interface FaceScanObjMetaData {
    gender: string;
    face_scan_id: string;
    email?: string;
    focal_length: string;
    customer_store_url: string;
    scan_type: string;
    callback_url?: string;
    body_scan_id?: string;
}
export type RequiredMetaDataKeys = "gender" | "focal_length" | "height" | "customer_store_url" | "clothes_fit";
export type RequiredFaceScanMetaDataKeys = "gender" | "focal_length" | "customer_store_url" | "scan_type" | "face_scan_id";
export declare const requiredMetaData: RequiredMetaDataKeys[];
export declare const requiredFaceScanMetaData: RequiredFaceScanMetaDataKeys[];
export declare const REQUIRED_MESSAGE: string;
export declare const REQUIRED_MESSAGE_FOR_META_DATA: string;
export declare const REQUIRED_ERROR_MESSAGE_INVALID_EMAIL = "Invalid Email";
export declare const CHUNK_SIZE: number;
