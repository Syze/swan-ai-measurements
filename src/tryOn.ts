import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_ERROR_MESSAGE_INVALID_EMAIL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl, isValidEmail } from "./utils.js";

interface UploadFileParams {
  files: File[];
  userEmail: string;
}

interface DeleteImageParams {
  userEmail: string;
  fileName: string;
}

interface HandleTryOnWebSocketParams {
  userEmail : string;
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
  firstImageName:string;
  secondImageName:string;
  onError?: (error: any) => void;
}

interface HandleTimeOutParams {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  shopDomain: string;
  userEmail: string;
  productName: string;
}

interface GetTryOnResultParams {
  shopDomain: string;
  userEmail: string;
  productName: string;
}

class TryOn {
  #tryOnSocketRef: WebSocket | null = null;
  #timerWaitingRef: ReturnType<typeof setTimeout> | null = null;
  #accessKey: string;
  #stagingUrl: boolean;
  constructor(accessKey: string, stagingUrl = false) {
    this.#accessKey = accessKey;
    this.#stagingUrl = stagingUrl;
  }

  async uploadFile({ files, userEmail }: UploadFileParams): Promise<string> {
    userEmail = userEmail.trim();
    if (checkParameters(files, userEmail) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }

    if(!isValidEmail(userEmail)){
      throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
    }

    if (files?.length > 2) {
      throw new Error("Cannot allow more than 2 files.");
    }
    try {
      const payload = {
        userEmail,
        userImages: [files[0]?.name],
      };
      if (files[1]) {
        payload.userImages.push(files[1].name);
      }
      const signedUrlRes = await this.#getSignedUrl(payload);
      for (const file of files) {
        await this.#s3Upload(signedUrlRes.data.uploadUrls[file.name].url, file);
      }
      return "uploaded successfully!";
    } catch (error) {
      throw error;
    }
  }

  #getSignedUrl(payload: { userEmail: string; userImages: string[] }): Promise<AxiosResponse<any>> {
    if (checkParameters(payload) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": this.#accessKey,
      },
    });
  }

  #s3Upload(url: string, file: File): Promise<AxiosResponse<any>> {
    if (checkParameters(url, file) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  }

  getUploadedFiles(userEmail: string): Promise<AxiosResponse<any>> {
    userEmail = userEmail.trim();
    if (checkParameters(userEmail) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if(!isValidEmail(userEmail)){
      throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
    }

    const payload = {
      userEmail
    };
    
    return axios.post(
      `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}`,
      payload,
      {
        headers: { "X-Api-Key": this.#accessKey },
      }
    );
  }

  deleteImage({ userEmail, fileName }: DeleteImageParams): Promise<AxiosResponse<any>> {
    userEmail = userEmail.trim();
    if (checkParameters(userEmail, fileName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if(!isValidEmail(userEmail)){
      throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
    }
    const payload={
      userEmail,
      file : fileName
    }
    return axios.delete(
      `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.TRY_ON_IMAGE_URLS}`,
      {
        headers: { "X-Api-Key": this.#accessKey },
        data: payload
      }
    );
  }

  #disconnectSocket = (): void => {
    this.#tryOnSocketRef?.close();
    if (this.#timerWaitingRef) {
      clearTimeout(this.#timerWaitingRef);
    }
  };

  #handleTimeOut = ({ onSuccess, onError, shopDomain, userEmail, productName }: HandleTimeOutParams): void => {
    this.#timerWaitingRef = setTimeout(() => {
      this.#handleGetTryOnResult({ shopDomain, userEmail, productName, onSuccess, onError });
      this.#disconnectSocket();
    }, 138000);
  };

  handleTryOnWebSocket = ({ userEmail, shopDomain, tryonId, productName, onError, onSuccess, onClose, onOpen }: HandleTryOnWebSocketParams): void => {
    if (checkParameters(shopDomain, tryonId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    this.#disconnectSocket();
    const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}?tryonId=${tryonId}`;
    this.#tryOnSocketRef = new WebSocket(url);
    this.#tryOnSocketRef.onopen = async () => {
      onOpen?.();
      this.#handleTimeOut({ onSuccess, onError, shopDomain, userEmail, productName });
    };
    this.#tryOnSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.status === "success") {
        onSuccess?.(data);
      } else {
        onError?.(data);
      }
      if (this.#timerWaitingRef) {
        clearTimeout(this.#timerWaitingRef);
      }
    };
    this.#tryOnSocketRef.onclose = () => {
      onClose?.();
    };
    this.#tryOnSocketRef.onerror = (event) => {
      onError?.(event);
      if (this.#timerWaitingRef) {
        clearTimeout(this.#timerWaitingRef);
      }
    };
  };

  handleSumbmitTryOn = async ({ userEmail, shopDomain, productName, firstImageName,secondImageName, onError }: HandleForLatestImageParams): Promise<any> => {
    userEmail = userEmail.trim();
    if (checkParameters(shopDomain, userEmail, productName,firstImageName,secondImageName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }

    if(!isValidEmail(userEmail)){
      throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
    }

    try {
      const payload = {
        productName,
        userEmail,
        customerStoreUrl : shopDomain,
        selectedUserImages: [
              firstImageName,
              secondImageName
          ]
      }

      const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${
        API_ENDPOINTS.TRY_ON
      }`;
      const res = await axios.post(url, payload, {
        headers: { "X-Api-Key": this.#accessKey },
      });
      if (res?.data?.tryOnProcessStatus === "failed") {
        this.#disconnectSocket();
        throw res.data;
      } else {
        return res.data;
      }
    } catch (error) {
      onError?.(error);
      this.#disconnectSocket();
      throw error;
    }
  };

  #handleGetTryOnResult = async ({ onSuccess, onError, shopDomain, userEmail, productName }: HandleTimeOutParams): Promise<void> => {
    try {
      const data = await this.getTryOnResult({ shopDomain, userEmail, productName });
      onSuccess?.(data.data);
    } catch (error) {
      onError?.(error);
    }
  };

  getTryOnResult = ({ userEmail, shopDomain, productName }: GetTryOnResultParams): Promise<AxiosResponse<any>> => {
    userEmail = userEmail.trim();
    if (checkParameters(shopDomain, userEmail, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }

    if(!isValidEmail(userEmail)){
      throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
    }

    const payload = {
      productName,
      userEmail,
      customerStoreUrl: shopDomain,
    }

    const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${
      API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD
    }`;
    return axios.post(url, payload, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  };
}

export default TryOn;
