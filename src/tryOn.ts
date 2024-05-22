import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants";
import { checkParameters } from "./utils";

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

interface HandleTimeOutParams {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  shopDomain: string;
  userId: string;
  productName: string;
}

interface GetTryOnResultParams {
  shopDomain: string;
  userId: string;
  productName: string;
}

class TryOn {
  #tryOnSocketRef: WebSocket | null = null;
  #timerWaitingRef: ReturnType<typeof setTimeout> | null = null;
  #accessKey: string;

  constructor(accessKey: string) {
    this.#accessKey = accessKey;
  }

  async uploadFile({ files, userId }: UploadFileParams): Promise<string> {
    try {
      const payload = {
        userId,
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

  #getSignedUrl(payload: { userId: string; userImages: string[] }): Promise<AxiosResponse<any>> {
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": this.#accessKey,
      },
    });
  }

  #s3Upload(url: string, file: File): Promise<AxiosResponse<any>> {
    return axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  }

  getUploadedFiles(userId: string): Promise<AxiosResponse<any>> {
    if (checkParameters(userId) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}?userId=${userId}`, null, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  deleteImage({ userId, fileName }: DeleteImageParams): Promise<AxiosResponse<any>> {
    if (checkParameters(userId, fileName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.delete(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_URLS}?userId=${userId}&file=${fileName}`, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  #disconnectSocket = (): void => {
    this.#tryOnSocketRef?.close();
    if (this.#timerWaitingRef) {
      clearTimeout(this.#timerWaitingRef);
    }
  };

  #handleTimeOut = ({ onSuccess, onError, shopDomain, userId, productName }: HandleTimeOutParams): void => {
    this.#timerWaitingRef = setTimeout(() => {
      this.#handleGetTryOnResult({ shopDomain, userId, productName, onSuccess, onError });
      this.#disconnectSocket();
    }, 120000);
  };

  handleTryOnWebSocket = ({ shopDomain, userId, productName, onError, onSuccess, onClose, onOpen }: HandleTryOnWebSocketParams): void => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    this.#disconnectSocket();
    const url = `${APP_AUTH_WEBSOCKET_URL}${API_ENDPOINTS.TRY_ON}/?store_url=${shopDomain}&product_name=${productName}&scan_id=${userId}`;
    this.#tryOnSocketRef = new WebSocket(url);
    this.#tryOnSocketRef.onopen = async () => {
      onOpen?.();
      this.#handleTimeOut({ onSuccess, onError, shopDomain, userId, productName });
      try {
        await this.handleForLatestImage({ shopDomain, userId, productName, onError });
      } catch (error) {
        onError?.(error);
      }
    };
    this.#tryOnSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.status === "success") {
        this.#handleGetTryOnResult({ shopDomain, userId, productName, onError, onSuccess });
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

  handleForLatestImage = async ({ userId, shopDomain, productName, onError }: HandleForLatestImageParams): Promise<any> => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    try {
      const url = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON}/?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
      const res = await axios.post(url, null, {
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

  #handleGetTryOnResult = async ({ onSuccess, onError, shopDomain, userId, productName }: HandleTimeOutParams): Promise<void> => {
    try {
      const data = await this.getTryOnResult({ shopDomain, userId, productName });
      onSuccess?.(data.data);
    } catch (error) {
      onError?.(error);
    }
  };

  getTryOnResult = ({ userId, shopDomain, productName }: GetTryOnResultParams): Promise<AxiosResponse<any>> => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const url = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
    return axios.post(url, null, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  };
}

export default TryOn;
