interface ObjMetaData {
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
interface UploadOptions {
    file: File;
    arrayMetaData: ObjMetaData[];
    scanId: string;
}
export default class FileUpload {
    #private;
    constructor(accessKey: string);
    uploadFile({ file, arrayMetaData, scanId }: UploadOptions): Promise<unknown>;
}
export {};
