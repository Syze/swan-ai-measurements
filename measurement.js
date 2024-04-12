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
  static accessKey;
  constructor(key) {
    Measurement.accessKey = key;
  }
  static tryOnSocketRef = null;
  static measurementSocketRef = null;
  static timerPollingRef = null;
  static timerWaitingRef = null;

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
    const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON}/${scanId}/shop/${shopDomain}/product/${productName}`;
    return axios.get(tryOnUrl);
  }

  handleTryOnSocket({ shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen }) {
    if (checkParameters(shopDomain, scanId, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    Measurement.tryOnSocketRef?.close();

    const url = `${APP_TRY_ON_WEBSOCKET_URL}/develop?store_url=${shopDomain}&product_name=${productName}&scan_id=${scanId}`;
    Measurement.tryOnSocketRef = new WebSocket(url);

    Measurement.tryOnSocketRef.onopen = () => {
      onOpen?.();
    };

    Measurement.tryOnSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.tryOnProcessStatus === "available") {
        onSuccess?.(data);
      } else {
        onError?.({ message: "failed to get image urls" });
      }
    };

    Measurement.tryOnSocketRef.onclose = () => {
      onClose?.();
    };

    Measurement.tryOnSocketRef.onerror = (event) => {
      onError?.(event);
    };
  }

  static getMeasurementsCheck = async (onSuccess, onError, scanId) => {
    try {
      const res = await getMeasurementStatus(scanId);
      if (res?.data && res?.data?.[0]?.isMeasured === true) {
        onSuccess?.(res?.data);
        clearInterval(Measurement.timerPollingRef);
      }
    } catch (e) {
      clearInterval(Measurement.timerPollingRef);
      onError?.(e);
    }
  };

  static handlePolling(onSuccess, onError) {
    clearInterval(Measurement.timerPollingRef);
    Measurement.timerPollingRef = setInterval(() => {
      Measurement.getMeasurementsCheck(onSuccess, onError);
    }, 5000);
  }

  static disconnectSocket = () => {
    Measurement.measurementSocketRef?.close();
    clearTimeout(Measurement.timerWaitingRef);
  };

  static handleTimeOut = (onSuccess, onError) => {
    Measurement.timerWaitingRef = setTimeout(() => {
      Measurement.handlePolling(onSuccess, onError);
      disconnectSocket();
    }, 2 * 60000);
  };

  handleMeasurementSocket = ({ scanId, onError, onSuccess, onClose, onOpen }) => {
    if (!scanId) {
      throw new Error(REQUIRED_MESSAGE);
    }
    Measurement.disconnectSocket();
    const url = `${APP_RECOMMENDATION_WEBSOCKET_URL}?scanId=${scanId}`;
    Measurement.measurementSocketRef = new WebSocket(url);

    Measurement.measurementSocketRef.onopen = () => {
      onOpen?.();
      Measurement.handleTimeOut(onSuccess, onError);
    };

    Measurement.measurementSocketRef.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.code === 200 && data?.scanStatus === "success") {
        onSuccess?.(data);
      } else {
        onError?.(data);
      }
      clearTimeout(Measurement.timerWaitingRef);
    };

    Measurement.measurementSocketRef.onclose = () => {
      onClose?.();
    };

    Measurement.measurementSocketRef.onerror = (event) => {
      onError?.(event);
    };
  };
}
