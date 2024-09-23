interface ObjMetaData {
    gender: string;
    scan_id?: string;
    email: string;
    focal_length: string;
    height: string;
    customer_store_url: string;
    clothes_fit: string;
    scan_type?: string;
    callback_url: string;
}
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
interface UploadOptions {
    file: File;
    arrayMetaData: Partial<ObjMetaData>[];
    scanId: string;
    email: string;
}
export default class FileUpload {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    uploadFileFrontend({ file, arrayMetaData, scanId, email }: UploadOptions): Promise<unknown>;
    uploadFile({ file, arrayMetaData, scanId, email }: UploadOptions): Promise<unknown>;
    setDeviceInfo(data: SetDeviceInfo): Promise<import("axios").AxiosResponse<any, any>>;
}
export {};
