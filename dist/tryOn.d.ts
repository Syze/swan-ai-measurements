import { AxiosResponse } from "axios";
interface UploadFileParams {
    files: File[];
    userEmail: string;
    fileNoLimit?: number;
}
interface DeleteImageParams {
    userEmail: string;
    fileName: string;
}
interface EligibiltyImageParams {
    storeUrl: string;
    productHandle: string;
    imageURL: string;
    productDescription: string;
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
    selectedUserImages: string[];
    requestSource?: string;
    callbackUrl?: string;
    openTryonId?: string;
    selectedProductImageUrl?: string;
}
interface GetTryOnResultParams {
    shopDomain: string;
    userEmail: string;
    productName: string;
}
declare class TryOn {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    uploadFile({ files, userEmail, fileNoLimit }: UploadFileParams): Promise<string>;
    getUploadedFiles(userEmail: string): Promise<AxiosResponse<any>>;
    deleteImage({ userEmail, fileName }: DeleteImageParams): Promise<AxiosResponse<any>>;
    handleTryOnWebSocket: ({ userEmail, shopDomain, tryonId, productName, onError, onSuccess, onClose, onOpen }: HandleTryOnWebSocketParams) => void;
    handleTryOnSubmit({ userEmail, shopDomain, productName, selectedUserImages, requestSource, callbackUrl, openTryonId, selectedProductImageUrl }: HandleForLatestImageParams): Promise<AxiosResponse<any>>;
    getShareLink(tryonId: string): Promise<AxiosResponse<any, any>>;
    getTryOnResult: ({ userEmail, shopDomain, productName }: GetTryOnResultParams) => Promise<AxiosResponse<any>>;
    getProductImageEligibility({ storeUrl, productHandle, imageURL, productDescription }: EligibiltyImageParams): Promise<AxiosResponse<any, any>>;
}
export default TryOn;
