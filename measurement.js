import axios from "axios";
import {
  API_ENDPOINTS,
  APP_AUTH_BASE_URL,
  APP_RECOMMENDATION_WEBSOCKET_URL,
  APP_TRY_ON_WEBSOCKET_URL,
  FILE_UPLOAD_KEY,
  FILE_UPLOAD_URL,
} from "./constants.js";

let tryOnSocketRef;
let measurementSocketRef;
let timerPollingRef;
let timerWaitingRef;

export const getMeasurementStatus = (scanId, accessKey) => {
  const url = `${FILE_UPLOAD_URL}/measurements?scanId=${scanId}`;
  return axios.get(url, {
    headers: { "X-Api-Key": FILE_UPLOAD_KEY },
  });
};

export const getTryOnMeasurements = ({ scanId, shopDomain, productName, accessKey }) => {
  const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON}/${scanId}/shop/${shopDomain}/product/${productName}`;
  return axios.get(tryOnUrl);
};

export const handleTryOnSocket = ({
  shopDomain,
  scanId,
  productName,
  accessKey,
  onError,
  onSuccess,
  onClose,
  onOpen,
}) => {
  if (tryOnSocketRef) {
    tryOnSocketRef.close();
  }
  const url = `${APP_TRY_ON_WEBSOCKET_URL}/develop?store_url=${shopDomain}&product_name=${productName}&scan_id=${scanId}`;
  tryOnSocketRef = new WebSocket(url);

  tryOnSocketRef.onopen = () => {
    if (onOpen) {
      onOpen();
    }
  };

  tryOnSocketRef.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data?.tryOnProcessStatus === "available") {
      if (onSuccess) {
        onSuccess(data);
      }
    } else {
      if (onError) {
        onError({ message: "failed to get image urls" });
      }
    }
  };

  tryOnSocketRef.onclose = () => {
    if (onClose) {
      onClose();
    }
  };

  tryOnSocketRef.onerror = (event) => {
    if (onError) {
      onError(event);
    }
  };
};

const getMeasurementsCheck = async (onSuccess, onError, scanId, accessKey) => {
  try {
    const res = await getMeasurementStatus(scanId, accessKey);
    if (res?.data && res?.data?.[0]?.isMeasured === true) {
      if (onSuccess) {
        onSuccess(res?.data);
      }
      clearInterval(timerPollingRef);
    }
  } catch (e) {
    clearInterval(timerPollingRef);
    if (onError) {
      onError(e);
    }
  }
};

const handlePolling = (onSuccess, onError) => {
  clearInterval(timerPollingRef);
  timerPollingRef = setInterval(() => {
    getMeasurementsCheck(onSuccess, onError);
  }, 5000);
};

const disconnectSocket = () => {
  if (measurementSocketRef) {
    measurementSocketRef.close();
    clearTimeout(timerWaitingRef);
  }
};

const handleTimeOut = (onSuccess, onError) => {
  timerWaitingRef = setTimeout(() => {
    handlePolling(onSuccess, onError);
    disconnectSocket();
  }, 2 * 60000);
};

export const handleMeasurementSocket = ({ scanId, accessKey, onError, onSuccess, onClose, onOpen }) => {
  disconnectSocket();
  const url = `${APP_RECOMMENDATION_WEBSOCKET_URL}?scanId=${scanId}`;
  measurementSocketRef = new WebSocket(url);

  measurementSocketRef.onopen = () => {
    if (onOpen) {
      onOpen();
    }
    handleTimeOut(onSuccess, onError);
  };

  measurementSocketRef.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data?.code === 200 && data?.scanStatus === "success") {
      if (onSuccess) {
        onSuccess(data);
      }
    } else {
      if (onError) {
        onError(data);
      }
    }
    clearTimeout(timerWaitingRef);
  };

  measurementSocketRef.onclose = () => {
    if (onClose) {
      onClose();
    }
  };

  measurementSocketRef.onerror = (event) => {
    if (onError) {
      onError(event);
    }
  };
};
