import axios from "axios";
import {
  API_ENDPOINTS,
  APP_AUTH_BASE_URL,
  APP_RECOMMENDATION_WEBSOCKET_URL,
  APP_TRY_ON_WEBSOCKET_URL,
  REQUIRED_MESSAGE,
} from "./constants.js";
import { checkParameters } from "./utils.js";

export default class Measurement {
  #tryOnSocketRef = null;
  #measurementSocketRef = null;
  #timerPollingRef = null;
  #timerWaitingRef = null;
  #count = 1;
  getMeasurementStatus(scanId, accessKey) {
    if (checkParameters(scanId, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const url = `${APP_AUTH_BASE_URL}/measurements?scanId=${scanId}`;
    return axios.get(url, {
      headers: { "X-Api-Key": accessKey },
    });
  }

  getTryOnMeasurements({ scanId, shopDomain, productName, accessKey }) {
    if (checkParameters(scanId, shopDomain, productName, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_SCAN}/${scanId}/shop/${shopDomain}/product/${productName}`;
    return axios.get(tryOnUrl, { headers: { "X-Api-Key": accessKey } });
  }

  handleTryOnSocket({ shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen, accessKey }) {
    if (checkParameters(shopDomain, scanId, productName, accessKey) === false) {
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

  #getMeasurementsCheck = async ({ scanId, onSuccess, onError, accessKey }) => {
    try {
      const res = await this.getMeasurementStatus(scanId, accessKey);
      if (res?.data && res?.data?.[0]?.isMeasured === true) {
        onSuccess?.(res?.data);
        clearInterval(this.#timerPollingRef);
      } else {
        if (this.#count < 8) {
          this.#count++;
          this.#handlePolling({ scanId, onSuccess, onError, accessKey });
        } else {
          this.#count = 1;
          clearInterval(this.#timerPollingRef);
          onError?.({ scanStatus: "failed", message: "failed to get measurement" });
        }
      }
    } catch (e) {
      clearInterval(this.#timerPollingRef);
      onError?.(e);
    }
  };

  #handlePolling({ scanId, onSuccess, onError, accessKey }) {
    clearInterval(this.#timerPollingRef);
    this.#timerPollingRef = setTimeout(() => {
      this.#getMeasurementsCheck({ scanId, onSuccess, onError, accessKey });
    }, this.#count * 5000);
  }

  #disconnectSocket = () => {
    this.#measurementSocketRef?.close();
    clearTimeout(this.#timerWaitingRef);
  };

  #handleTimeOut = ({ scanId, onSuccess, onError, accessKey }) => {
    this.#count = 1;
    this.#timerWaitingRef = setTimeout(() => {
      this.#handlePolling({ scanId, onSuccess, onError, accessKey });
      this.#disconnectSocket();
    }, 2 * 60000);
  };

  handleMeasurementSocket = ({ scanId, onError, onSuccess, onClose, onOpen, accessKey }) => {
    if (checkParameters(scanId, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    setTimeout(() => {
      this.#disconnectSocket();
      const url = `${APP_RECOMMENDATION_WEBSOCKET_URL}?scanId=${scanId}`;
      this.#measurementSocketRef = new WebSocket(url);

      this.#measurementSocketRef.onopen = () => {
        onOpen?.();
        this.#handleTimeOut({ scanId, onSuccess, onError, accessKey });
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
    }, 5000);
  };
}
