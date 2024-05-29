import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";

interface TryOnSocketOptions {
  shopDomain: string;
  scanId: string;
  productName: string;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

interface MeasurementSocketOptions {
  scanId: string;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

interface GetMeasurementsCheckOptions {
  scanId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface HandlePollingOptions {
  scanId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface HandleTimeOutOptions {
  scanId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

class Measurement {
  #tryOnSocketRef: WebSocket | null = null;
  #measurementSocketRef: WebSocket | null = null;
  #timerPollingRef: NodeJS.Timeout | null = null;
  #timerWaitingRef: NodeJS.Timeout | null = null;
  #count: number = 1;
  #accessKey: string;
  #stagingUrl: boolean;

  constructor(accessKey: string, stagingUrl = false) {
    this.#accessKey = accessKey;
    this.#stagingUrl = stagingUrl;
  }

  getMeasurementResult(scanId: string): Promise<AxiosResponse<any>> {
    if (!checkParameters(scanId)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}/measurements?scanId=${scanId}`;
    return axios.get(url, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  getTryOnMeasurements({ scanId, shopDomain, productName }: TryOnSocketOptions): Promise<AxiosResponse<any>> {
    if (!checkParameters(scanId, shopDomain, productName)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    const tryOnUrl = `${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${
      API_ENDPOINTS.TRY_ON_SCAN
    }/${scanId}/shop/${shopDomain}/product/${productName}`;
    return axios.get(tryOnUrl, { headers: { "X-Api-Key": this.#accessKey } });
  }

  handleTryOnSocket(options: TryOnSocketOptions): void {
    const { shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen } = options;

    if (!checkParameters(shopDomain, scanId, productName)) {
      throw new Error(REQUIRED_MESSAGE);
    }

    this.#tryOnSocketRef?.close();
    const url = `${getUrl({
      urlName: APP_BASE_WEBSOCKET_URL,
      stagingUrl: this.#stagingUrl,
    })}/develop?store_url=${shopDomain}&product_name=${productName}&scan_id=${scanId}`;
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

  async #getMeasurementsCheck(options: GetMeasurementsCheckOptions): Promise<void> {
    const { scanId, onSuccess, onError } = options;

    try {
      const res = await this.getMeasurementResult(scanId);
      if (res?.data && res?.data?.isMeasured === true) {
        onSuccess?.(res.data);
        if (this.#timerPollingRef) {
          clearInterval(this.#timerPollingRef);
        }
      } else {
        if (this.#count < 8) {
          this.#count++;
          this.#handlePolling({ scanId, onSuccess, onError });
        } else {
          this.#count = 1;
          if (this.#timerPollingRef) {
            clearInterval(this.#timerPollingRef);
          }
          onError?.({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
        }
      }
    } catch (e) {
      if (this.#timerPollingRef) {
        clearInterval(this.#timerPollingRef);
      }
      onError?.(e);
    }
  }

  #handlePolling(options: HandlePollingOptions): void {
    const { scanId, onSuccess, onError } = options;

    if (this.#timerPollingRef) {
      clearInterval(this.#timerPollingRef);
    }

    this.#timerPollingRef = setTimeout(() => {
      this.#getMeasurementsCheck({ scanId, onSuccess, onError });
    }, this.#count * 5000);
  }

  #disconnectSocket(): void {
    this.#measurementSocketRef?.close();
    if (this.#timerWaitingRef) {
      clearTimeout(this.#timerWaitingRef);
    }
  }

  #handleTimeOut(options: HandleTimeOutOptions): void {
    const { scanId, onSuccess, onError } = options;

    this.#count = 1;
    this.#timerWaitingRef = setTimeout(() => {
      this.#handlePolling({ scanId, onSuccess, onError });
      this.#disconnectSocket();
    }, 2 * 60000);
  }

  handleMeasurementSocket(options: MeasurementSocketOptions): void {
    const { scanId, onError, onSuccess, onClose, onOpen } = options;

    if (!checkParameters(scanId)) {
      throw new Error(REQUIRED_MESSAGE);
    }

    setTimeout(() => {
      this.#disconnectSocket();
      const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.SCANNING}?scanId=${scanId}`;
      this.#measurementSocketRef = new WebSocket(url);
      this.#measurementSocketRef.onopen = () => {
        onOpen?.();
        this.#handleTimeOut({ scanId, onSuccess, onError });
      };

      this.#measurementSocketRef.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data?.code === 200 && data?.scanStatus === "success") {
          onSuccess?.(data);
        } else {
          onError?.(data);
        }
        if (this.#timerWaitingRef) {
          clearTimeout(this.#timerWaitingRef);
        }
      };

      this.#measurementSocketRef.onclose = () => {
        onClose?.();
      };

      this.#measurementSocketRef.onerror = (event: Event) => {
        onError?.(event);
      };
    }, 5000);
  }
}

export default Measurement;
