import { BodyScanObjMetaData, FaceScanObjMetaData } from "./constants";
export interface SetDeviceInfo {
    detection?: string;
    model?: string;
    gyro: {
        alpha?: string;
        gamma?: string;
        beta?: string;
        timestamp?: string;
    }[];
    scanId: string;
}
export interface BodyScanUploadOptions {
    file: File;
    arrayMetaData: Partial<BodyScanObjMetaData>[];
    scanId: string;
    email: string;
    callBack?: (a: {
        eventName: string;
        message: string;
        scanId?: string;
        email?: string;
        objectKey?: string;
    }) => void;
}
export interface FaceScanUploadOptions {
    file: File;
    arrayMetaData: Partial<FaceScanObjMetaData>[];
    objectKey: string;
    email: string;
    contentType: string;
    callBack?: (a: {
        eventName: string;
        message: string;
        objectKey?: string;
        email?: string;
        scanId?: string;
    }) => void;
}
export interface UploadOptions {
    file: File;
    arrayMetaData: Partial<BodyScanObjMetaData>[] | Partial<FaceScanObjMetaData>[];
    scanId?: string;
    email: string;
    objectKey?: string;
    callBack?: (a: {
        eventName: string;
        message: string;
        scanId?: string;
        email?: string;
        objectKey?: string;
    }) => void;
}
