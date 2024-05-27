import { AxiosResponse } from "axios";
interface UploadFileParams {
    files: File[];
    userId: string;
}
interface DeleteImageParams {
    userId: string;
    fileName: string;
}
interface HandleTryOnWebSocketParams {
    shopDomain: string;
    userId: string;
    productName: string;
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
    onClose?: () => void;
    onOpen?: () => void;
}
interface HandleForLatestImageParams {
    shopDomain: string;
    userId: string;
    productName: string;
    onError?: (error: any) => void;
}
interface GetTryOnResultParams {
    shopDomain: string;
    userId: string;
    productName: string;
}
declare class TryOn {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    uploadFile({ files, userId }: UploadFileParams): Promise<string>;
    getUploadedFiles(userId: string): Promise<AxiosResponse<any>>;
    deleteImage({ userId, fileName }: DeleteImageParams): Promise<AxiosResponse<any>>;
    handleTryOnWebSocket: ({ shopDomain, userId, productName, onError, onSuccess, onClose, onOpen }: HandleTryOnWebSocketParams) => void;
    handleForLatestImage: ({ userId, shopDomain, productName, onError }: HandleForLatestImageParams) => Promise<any>;
    getTryOnResult: ({ userId, shopDomain, productName }: GetTryOnResultParams) => Promise<AxiosResponse<any>>;
}
export default TryOn;
