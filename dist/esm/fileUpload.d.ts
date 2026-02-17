import { URLType } from "./enum.js";
import { BodyScanUploadOptions, FaceScanUploadOptions, SetDeviceInfo } from "./interface.js";
export default class FileUpload {
    #private;
    constructor(accessKey?: string, urlType?: URLType, token?: string);
    uploadFileFrontend({ file, arrayMetaData, scanId, email, callBack }: BodyScanUploadOptions): Promise<unknown>;
    faceScanFileUploader({ file, arrayMetaData, objectKey, email, callBack }: FaceScanUploadOptions): Promise<unknown>;
    uploadFile({ file, arrayMetaData, scanId, email }: BodyScanUploadOptions): Promise<unknown>;
    setDeviceInfo(data: SetDeviceInfo): Promise<import("axios").AxiosResponse<any, any>>;
}
