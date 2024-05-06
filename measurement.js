import axios from "axios";
import {
  API_ENDPOINTS,
  APP_AUTH_BASE_URL,
  APP_RECOMMENDATION_WEBSOCKET_URL,
  APP_TRY_ON_WEBSOCKET_URL,
  FILE_UPLOAD_KEY,
  REQUIRED_MESSAGE,
} from "./constants.js";
import { checkParameters } from "./utils.js";

export default class Measurement {
  #accessKey;
  #tryOnSocketRef = null;
  #measurementSocketRef = null;
  #timerPollingRef = null;
  #timerWaitingRef = null;
  constructor(key) {
    this.#accessKey = key;
  }

  getMeasurementStatus(scanId) {
    if (!scanId) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const url = `${APP_AUTH_BASE_URL}/measurements?scanId=${scanId}`;
    return axios.get(url, {
      headers: { "X-Api-Key": FILE_UPLOAD_KEY },
    });
  }

  getTryOnMeasurements({ scanId, shopDomain, productName }) {
    if (checkParameters(scanId, shopDomain, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_SCAN}/${scanId}/shop/${shopDomain}/product/${productName}`;
    return axios.get(tryOnUrl);
  }

  handleTryOnSocket({ shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen }) {
    if (checkParameters(shopDomain, scanId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    this.#tryOnSocketRef?.close();

    const url = `${APP_TRY_ON_WEBSOCKET_URL}/develop?store_url=${shopDomain}&product_name=${productName}&scan_id=${scanId}`;
    this.#tryOnSocketRef = new WebSocket(url);

    this.#tryOnSocketRef.onopen = () => {
      onOpen?.();
    };

    this.#tryOnSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.tryOnProcessStatus === "available") {
        onSuccess?.(data);
      } else {
        onError?.({ message: "failed to get image urls" });
      }
    };

    this.#tryOnSocketRef.onclose = () => {
      onClose?.();
    };

    this.#tryOnSocketRef.onerror = (event) => {
      onError?.(event);
    };
  }

  #getMeasurementsCheck = async (onSuccess, onError, scanId) => {
    try {
      const res = await this.getMeasurementStatus(scanId);
      if (res?.data && res?.data?.[0]?.isMeasured === true) {
        onSuccess?.(res?.data);
        clearInterval(this.#timerPollingRef);
      }
    } catch (e) {
      clearInterval(this.#timerPollingRef);
      onError?.(e);
    }
  };

  #handlePolling(onSuccess, onError) {
    clearInterval(this.#timerPollingRef);
    this.#timerPollingRef = setInterval(() => {
      this.#getMeasurementsCheck(onSuccess, onError);
    }, 5000);
  }

  #disconnectSocket = () => {
    this.#measurementSocketRef?.close();
    clearTimeout(this.#timerWaitingRef);
  };

  #handleTimeOut = (onSuccess, onError) => {
    this.#timerWaitingRef = setTimeout(() => {
      this.#handlePolling(onSuccess, onError);
      this.#disconnectSocket();
    }, 2 * 60000);
  };

  handleMeasurementSocket = ({ scanId, onError, onSuccess, onClose, onOpen }) => {
    if (!scanId) {
      throw new Error(REQUIRED_MESSAGE);
    }
    this.#disconnectSocket();
    const url = `${APP_RECOMMENDATION_WEBSOCKET_URL}?scanId=${scanId}`;
    this.#measurementSocketRef = new WebSocket(url);

    this.#measurementSocketRef.onopen = () => {
      onOpen?.();
      this.#handleTimeOut(onSuccess, onError);
    };

    this.#measurementSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.code === 200 && data?.scanStatus === "success") {
        onSuccess?.(data);
      } else {
        onError?.(data);
      }
      clearTimeout(this.#timerWaitingRef);
    };

    this.#measurementSocketRef.onclose = () => {
      onClose?.();
    };

    this.#measurementSocketRef.onerror = (event) => {
      onError?.(event);
    };
  };
}
