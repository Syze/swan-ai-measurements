import axios from "axios";
import {
  API_ENDPOINTS,
  APP_AUTH_BASE_URL,
  APP_RECOMMENDATION_WEBSOCKET_URL,
  APP_TRY_ON_WEBSOCKET_URL,
  FILE_UPLOAD_KEY,
} from "./constants.js";

export default class Measurement {
  static tryOnSocketRef = null;
  static measurementSocketRef = null;
  static timerPollingRef = null;
  static timerWaitingRef = null;

  getMeasurementStatus(scanId, accessKey) {
    const url = `${APP_AUTH_BASE_URL}/measurements?scanId=${scanId}`;
    return axios.get(url, {
      headers: { "X-Api-Key": FILE_UPLOAD_KEY },
    });
  }

  getTryOnMeasurements({ scanId, shopDomain, productName, accessKey }) {
    const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON}/${scanId}/shop/${shopDomain}/product/${productName}`;
    return axios.get(tryOnUrl);
  }

  handleTryOnSocket({ shopDomain, scanId, productName, accessKey, onError, onSuccess, onClose, onOpen }) {
    this.tryOnSocketRef?.close();

    const url = `${APP_TRY_ON_WEBSOCKET_URL}/develop?store_url=${shopDomain}&product_name=${productName}&scan_id=${scanId}`;
    this.tryOnSocketRef = new WebSocket(url);

    this.tryOnSocketRef.onopen = () => {
      onOpen?.();
    };

    this.tryOnSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.tryOnProcessStatus === "available") {
        onSuccess?.(data);
      } else {
        onError?.({ message: "failed to get image urls" });
      }
    };

    this.tryOnSocketRef.onclose = () => {
      onClose?.();
    };

    this.tryOnSocketRef.onerror = (event) => {
      onError?.(event);
    };
  }

  static getMeasurementsCheck = async (onSuccess, onError, scanId, accessKey) => {
    try {
      const res = await getMeasurementStatus(scanId, accessKey);
      if (res?.data && res?.data?.[0]?.isMeasured === true) {
        onSuccess?.(res?.data);
        clearInterval(this.timerPollingRef);
      }
    } catch (e) {
      clearInterval(this.timerPollingRef);
      onError?.(e);
    }
  };

  static handlePolling(onSuccess, onError) {
    clearInterval(this.timerPollingRef);
    this.timerPollingRef = setInterval(() => {
      this.getMeasurementsCheck(onSuccess, onError);
    }, 5000);
  }

  static disconnectSocket = () => {
    this.measurementSocketRef?.close();
    clearTimeout(this.timerWaitingRef);
  };

  static handleTimeOut = (onSuccess, onError) => {
    this.timerWaitingRef = setTimeout(() => {
      this.handlePolling(onSuccess, onError);
      disconnectSocket();
    }, 2 * 60000);
  };

  handleMeasurementSocket = ({ scanId, accessKey, onError, onSuccess, onClose, onOpen }) => {
    this.disconnectSocket();
    const url = `${APP_RECOMMENDATION_WEBSOCKET_URL}?scanId=${scanId}`;
    this.measurementSocketRef = new WebSocket(url);

    this.measurementSocketRef.onopen = () => {
      onOpen?.();
      this.handleTimeOut(onSuccess, onError);
    };

    this.measurementSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.code === 200 && data?.scanStatus === "success") {
        onSuccess?.(data);
      } else {
        onError?.(data);
      }
      clearTimeout(this.timerWaitingRef);
    };

    this.measurementSocketRef.onclose = () => {
      onClose?.();
    };

    this.measurementSocketRef.onerror = (event) => {
      onError?.(event);
    };
  };
}
