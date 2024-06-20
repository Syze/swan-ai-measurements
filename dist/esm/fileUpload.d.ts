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
}
export {};
