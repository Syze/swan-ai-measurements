import { AxiosResponse } from "axios";
interface UploadFileParams {
    files: File[];
    userEmail: string;
}
interface DeleteImageParams {
    userEmail: string;
    fileName: string;
}
interface HandleTryOnWebSocketParams {
    userEmail: string;
    shopDomain: string;
    tryonId: string;
    productName: string;
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
    onClose?: () => void;
    onOpen?: () => void;
}
interface HandleForLatestImageParams {
    shopDomain: string;
    userEmail: string;
    productName: string;
    firstImageName: string;
    secondImageName: string;
    onError?: (error: any) => void;
}
interface GetTryOnResultParams {
    shopDomain: string;
    userEmail: string;
    productName: string;
}
declare class TryOn {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    uploadFile({ files, userEmail }: UploadFileParams): Promise<string>;
    getUploadedFiles(userEmail: string): Promise<AxiosResponse<any>>;
    deleteImage({ userEmail, fileName }: DeleteImageParams): Promise<AxiosResponse<any>>;
    handleTryOnWebSocket: ({ userEmail, shopDomain, tryonId, productName, onError, onSuccess, onClose, onOpen }: HandleTryOnWebSocketParams) => void;
    handleTryOnSubmit({ userEmail, shopDomain, productName, firstImageName, secondImageName, }: HandleForLatestImageParams): Promise<AxiosResponse<any>>;
    getTryOnResult: ({ userEmail, shopDomain, productName }: GetTryOnResultParams) => Promise<AxiosResponse<any>>;
}
export default TryOn;
