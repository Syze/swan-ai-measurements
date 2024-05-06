import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";

class TryOn {
  #accessKey = null;
  #tryOnSocketRef = null;
  #timerWaitingRef = null;
  constructor(accessKey) {
    this.#accessKey = accessKey;
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
        const signedUrlRes = await this.#getSignedUrl(payload);
        for (const file of files) {
          await this.#s3Upload(signedUrlRes?.data?.uploadUrls?.[file.name]?.url, file);
        }
        resolve("uploaded successfully!");
      } catch (error) {
        reject(error);
      }
    });
  }

  #getSignedUrl(payload) {
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  #s3Upload(url, file) {
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

  #disconnectSocket = () => {
    this.#tryOnSocketRef?.close();
    clearTimeout(this.#timerWaitingRef);
  };

  #handleTimeOut = ({ onSuccess, onError, shopDomain, userId, productName }) => {
    this.#timerWaitingRef = setTimeout(() => {
      this.#handleGetTryOnResult({ shopDomain, userId, productName, onSuccess, onError });
      this.#disconnectSocket();
    }, 78000);
  };

  handleTryOnWebSocket = ({ shopDomain, userId, productName, onError, onSuccess, onClose, onOpen }) => {
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
        await this.handleForLatestImage({ shopDomain, userId, productName });
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
      clearTimeout(this.#tryOnSocketRef);
    };
    this.#tryOnSocketRef.onclose = () => {
      onClose?.();
    };
    this.#tryOnSocketRef.onerror = (event) => {
      onError?.(event);
      clearTimeout(this.#tryOnSocketRef);
    };
  };

  handleForLatestImage = async ({ userId, shopDomain, productName, onError }) => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return new Promise(async (resolve, reject) => {
      try {
        const url = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON}/?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
        const res = await axios.post(url);
        if (res?.data?.tryOnProcessStatus === "failed") {
          this.#disconnectSocket();
          reject(res?.data);
        } else {
          resolve(res?.data);
        }
      } catch (error) {
        onError?.(error);
        this.#disconnectSocket();
        reject(error);
      }
    });
  };

  #handleGetTryOnResult = async ({ onSuccess, onError, shopDomain, userId, productName }) => {
    try {
      const data = await this.getTryOnResult({ shopDomain, userId, productName });
      onSuccess?.(data?.data);
    } catch (error) {
      onError?.(error);
    }
  };

  getTryOnResult = ({ userId, shopDomain, productName }) => {
    if (checkParameters(shopDomain, userId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const url = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
    return axios.post(url);
  };
}

export default TryOn;
