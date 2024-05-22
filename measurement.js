import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_RECOMMENDATION_WEBSOCKET_URL, APP_TRY_ON_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";

/**
 * Class representing measurement-related functionality.
 */
class Measurement {
  #tryOnSocketRef = null;
  #measurementSocketRef = null;
  #timerPollingRef = null;
  #timerWaitingRef = null;
  #count = 1;
  #accessKey;

  /**
   * Constructs a new instance of the Measurement class.
   * @param {string} accessKey - The access key used for authentication.
   */
  constructor(accessKey) {
    this.#accessKey = accessKey;
  }

  /**
   * Retrieves the measurement status for a given scan ID.
   * @param {string} scanId - The ID of the scan.
   * @returns {Promise} - The axios response promise.
   * @throws {Error} - If the required parameter is missing.
   */
  getMeasurementStatus(scanId) {
    if (checkParameters(scanId) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const url = `${APP_AUTH_BASE_URL}/measurements?scanId=${scanId}`;
    return axios.get(url, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  /**
   * Retrieves the try-on measurements for a given scan ID, shop domain, and product name.
   * @param {Object} params - The parameters for the try-on measurements.
   * @param {string} params.scanId - The ID of the scan.
   * @param {string} params.shopDomain - The shop domain.
   * @param {string} params.productName - The product name.
   * @returns {Promise} - The axios response promise.
   * @throws {Error} - If the required parameters are missing.
   */
  getTryOnMeasurements({ scanId, shopDomain, productName }) {
    if (checkParameters(scanId, shopDomain, productName) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_SCAN}/${scanId}/shop/${shopDomain}/product/${productName}`;
    return axios.get(tryOnUrl, { headers: { "X-Api-Key": this.#accessKey } });
  }

  /**
   * Handles the try-on WebSocket connection.
   * @param {Object} params - The parameters for the WebSocket connection.
   * @param {string} params.shopDomain - The shop domain.
   * @param {string} params.scanId - The ID of the scan.
   * @param {string} params.productName - The product name.
   * @param {function} [params.onError] - Optional. Callback function to handle errors.
   * @param {function} [params.onSuccess] - Optional. Callback function to handle successful messages.
   * @param {function} [params.onClose] - Optional. Callback function to handle WebSocket close event.
   * @param {function} [params.onOpen] - Optional. Callback function to handle WebSocket open event.
   */
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

  /**
   * Checks the measurement status and handles polling.
   * @param {Object} params - The parameters for checking measurements.
   * @param {string} params.scanId - The ID of the scan.
   * @param {function} [params.onSuccess] - Optional. Callback function to handle successful status check.
   * @param {function} [params.onError] - Optional. Callback function to handle errors.
   * @private
   */
  async #getMeasurementsCheck({ scanId, onSuccess, onError }) {
    try {
      const res = await this.getMeasurementStatus(scanId);
      if (res?.data && res?.data?.[0]?.isMeasured === true) {
        onSuccess?.(res?.data);
        clearInterval(this.#timerPollingRef);
      } else {
        if (this.#count < 8) {
          this.#count++;
          this.#handlePolling({ scanId, onSuccess, onError });
        } else {
          this.#count = 1;
          clearInterval(this.#timerPollingRef);
          onError?.({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
        }
      }
    } catch (e) {
      clearInterval(this.#timerPollingRef);
      onError?.(e);
    }
  }

  /**
   * Handles polling for measurements.
   * @param {Object} params - The parameters for polling.
   * @param {string} params.scanId - The ID of the scan.
   * @param {function} [params.onSuccess] - Optional. Callback function to handle successful polling.
   * @param {function} [params.onError] - Optional. Callback function to handle errors.
   * @private
   */
  #handlePolling({ scanId, onSuccess, onError }) {
    clearInterval(this.#timerPollingRef);
    this.#timerPollingRef = setTimeout(() => {
      this.#getMeasurementsCheck({ scanId, onSuccess, onError });
    }, this.#count * 5000);
  }

  /**
   * Disconnects the measurement WebSocket and clears the timeout.
   * @private
   */
  #disconnectSocket() {
    this.#measurementSocketRef?.close();
    clearTimeout(this.#timerWaitingRef);
  }

  /**
   * Handles the timeout for the measurement WebSocket.
   * @param {Object} params - The parameters for handling timeout.
   * @param {string} params.scanId - The ID of the scan.
   * @param {function} [params.onSuccess] - Optional. Callback function to handle successful timeout.
   * @param {function} [params.onError] - Optional. Callback function to handle errors.
   * @private
   */
  #handleTimeOut({ scanId, onSuccess, onError }) {
    this.#count = 1;
    this.#timerWaitingRef = setTimeout(() => {
      this.#handlePolling({ scanId, onSuccess, onError });
      this.#disconnectSocket();
    }, 2 * 60000);
  }

  /**
   * Handles the measurement WebSocket connection.
   * @param {Object} params - The parameters for the WebSocket connection.
   * @param {string} params.scanId - The ID of the scan.
   * @param {function} [params.onError] - Optional. Callback function to handle errors.
   * @param {function} [params.onSuccess] - Optional. Callback function to handle successful messages.
   * @param {function} [params.onClose] - Optional. Callback function to handle WebSocket close event.
   * @param {function} [params.onOpen] - Optional. Callback function to handle WebSocket open event.
   */
  handleMeasurementSocket({ scanId, onError, onSuccess, onClose, onOpen }) {
    if (checkParameters(scanId) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    setTimeout(() => {
      this.#disconnectSocket();
      const url = `${APP_RECOMMENDATION_WEBSOCKET_URL}?scanId=${scanId}`;
      this.#measurementSocketRef = new WebSocket(url);
      this.#measurementSocketRef.onopen = () => {
        onOpen?.();
        this.#handleTimeOut({ scanId, onSuccess, onError });
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
  }
}

export default Measurement;
