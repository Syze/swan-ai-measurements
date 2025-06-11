import { BodyScanObjMetaData, FaceScanObjMetaData } from "./constants.js";
interface SetDeviceInfo {
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
interface BodyScanUploadOptions {
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
interface FaceScanUploadOptions {
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
export default class FileUpload {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    uploadFileFrontend({ file, arrayMetaData, scanId, email, callBack }: BodyScanUploadOptions): Promise<unknown>;
    faceScanFileUploader({ file, arrayMetaData, objectKey, email, callBack }: FaceScanUploadOptions): Promise<unknown>;
    uploadFile({ file, arrayMetaData, scanId, email }: BodyScanUploadOptions): Promise<unknown>;
    setDeviceInfo(data: SetDeviceInfo): Promise<import("axios").AxiosResponse<any, any>>;
}
export {};
