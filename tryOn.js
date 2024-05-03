import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants";
import { checkParameters } from "./utils";

class TryOn {
  static accessKey;
  static tryOnSocketRef = null;
  static timerWaitingRef = null;
  constructor(accessKey) {
    TryOn.accessKey = accessKey;
  }

  uploadFile(files, userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const payload = {
          userId,
          userImages: [files?.[0]?.name],
        };
        if (files?.[1]) {
          payload.userImages.push(files?.[1]?.name);
        }
        const signedUrlRes = await TryOn.getSignedUrl(payload);
        for (const file of files) {
          await TryOn.s3Upload(signedUrlRes?.data?.uploadUrls?.[file.name]?.url, file);
        }
        resolve("uploaded successfully!");
      } catch (error) {
        reject(error);
      }
    });
  }

  static getSignedUrl(payload) {
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  static s3Upload(url, file) {
    return axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  }

  getUploadedFiles(userId) {
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}?userId=${userId}`);
  }

  deleteImage(userId, name) {
    return axios.delete(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_URLS}?userId=${userId}&file=${name}`);
  }

  static disconnectSocket = () => {
    TryOn.tryOnSocketRef?.close();
    clearTimeout(TryOn.timerWaitingRef);
  };

  static handleTimeOut = ({ onSuccess, onError, shopDomain, userId, productName }) => {
    TryOn.timerWaitingRef = setTimeout(() => {
      this.getTryOnResult({ shopDomain, userId, productName });
      TryOn.disconnectSocket();
    }, 78000);
  };

  handleTryOnWebSocket = ({ shopDomain, userId, productName, onError, onSuccess, onClose, onOpen }) => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    TryOn.disconnectSocket();
    TryOn.tryOnSocketRef = new WebSocket(url);
    TryOn.tryOnSocketRef.onopen = async () => {
      onOpen?.();
      TryOn.handleTimeOut({ onSuccess, onError, shopDomain, userId, productName });
      try {
        await this.handleForLatestImage({ shopDomain, userId, productName });
      } catch (error) {
        onError?.(error);
      }
    };
    TryOn.tryOnSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.status === "success") {
        this.getTryOnResult({ shopDomain, userId, productName });
      } else {
        onError?.(data);
      }
      clearTimeout(TryOn.tryOnSocketRef);
    };
    TryOn.tryOnSocketRef.onclose = () => {
      onclose?.();
    };
    TryOn.tryOnSocketRef.onerror = (event) => {
      onError?.(event);
      clearTimeout(TryOn.tryOnSocketRef);
    };
  };

  handleForLatestImage = async ({ userId, shopDomain, productName, onError }) => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return new Promise(async (resolve, reject) => {
      try {
        const url = `${APP_AUTH_BASE_URL}/tryon/?scan_id=${id}&store_url=${shopDomain}&product_name=${productName}`;
        const res = await axios.post(url);
        if (res?.data?.tryOnProcessStatus === "failed") {
          TryOn.disconnectSocket();
          reject(res?.data);
        } else {
          resolve(res?.data);
        }
      } catch (error) {
        onError?.(error);
        TryOn.disconnectSocket();
        reject(error);
      }
    });
  };

  handleGetTryOnResult = async ({ onSuccess, onError, shopDomain, userId, productName }) => {
    try {
      const data = await this.getTryOnResult({ shopDomain, userId, productName });
      onSuccess?.(data?.data);
    } catch (error) {
      onError?.(error);
    }
  };

  getTryOnResult = async ({ userId, shopDomain, productName }) => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const url = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
    return axios.post(url);
  };
}

export default TryOn;
