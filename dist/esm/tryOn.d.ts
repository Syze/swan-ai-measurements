import { AxiosResponse } from "axios";
import { URLType } from "./enum.js";
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
    tryonId: string;
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
    onClose?: () => void;
    onOpen?: () => void;
}
interface Products {
    productUrl: string;
    productHandle: string;
    openTryonId?: string;
    selectedProductImageUrl?: string;
}
interface HandleForLatestImageParams {
    shopDomain: string;
    products: Products[];
    selectedUserImages?: string[];
    requestSource?: string;
    callbackUrl?: string;
    openTryonId?: string;
    selectedProductImageUrl?: string;
    token: string;
    requestedTryonViews?: string[];
}
interface GetTryOnResultParams {
    tryonId: string;
}
declare class TryOn {
    #private;
    constructor(accessKey: string, urlType?: URLType);
    uploadFile({ files, userEmail, fileNoLimit }: UploadFileParams): Promise<string>;
    getUploadedFiles(userEmail: string): Promise<AxiosResponse<any>>;
    deleteImage({ userEmail, fileName }: DeleteImageParams): Promise<AxiosResponse<any>>;
    handleTryOnWebSocket: ({ tryonId, onError, onSuccess, onClose, onOpen }: HandleTryOnWebSocketParams) => void;
    handleTryOnSubmit({ shopDomain, products, selectedUserImages, requestSource, callbackUrl, openTryonId, selectedProductImageUrl, token, requestedTryonViews }: HandleForLatestImageParams): Promise<AxiosResponse<any>>;
    getShareLink(tryonId: string, token: string): Promise<AxiosResponse<any>>;
    getTryOnResult: ({ tryonId }: GetTryOnResultParams) => Promise<AxiosResponse<any>>;
    getProductImageEligibility({ storeUrl, productHandle, imageURL, productDescription }: EligibiltyImageParams): Promise<AxiosResponse<any, any>>;
}
export default TryOn;
