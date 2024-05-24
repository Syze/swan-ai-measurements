import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_RECOMMENDATION_WEBSOCKET_URL, APP_TRY_ON_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";
class Measurement {
    #tryOnSocketRef = null;
    #measurementSocketRef = null;
    #timerPollingRef = null;
    #timerWaitingRef = null;
    #count = 1;
    #accessKey;
    constructor(accessKey) {
        this.#accessKey = accessKey;
    }
    getMeasurementResult(scanId) {
        if (!checkParameters(scanId)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        const url = `${APP_AUTH_BASE_URL}/measurements?scanId=${scanId}`;
        return axios.get(url, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    getTryOnMeasurements({ scanId, shopDomain, productName }) {
        if (!checkParameters(scanId, shopDomain, productName)) {
            throw new Error(REQUIRED_MESSAGE);
        }
        const tryOnUrl = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_SCAN}/${scanId}/shop/${shopDomain}/product/${productName}`;
        return axios.get(tryOnUrl, { headers: { "X-Api-Key": this.#accessKey } });
    }
    handleTryOnSocket(options) {
        const { shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen } = options;
        if (!checkParameters(shopDomain, scanId, productName)) {
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
            }
            else {
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
    async #getMeasurementsCheck(options) {
        const { scanId, onSuccess, onError } = options;
        try {
            const res = await this.getMeasurementResult(scanId);
            if (res?.data && res?.data?.isMeasured === true) {
                onSuccess?.(res.data);
                if (this.#timerPollingRef) {
                    clearInterval(this.#timerPollingRef);
                }
            }
            else {
                if (this.#count < 8) {
                    this.#count++;
                    this.#handlePolling({ scanId, onSuccess, onError });
                }
                else {
                    this.#count = 1;
                    if (this.#timerPollingRef) {
                        clearInterval(this.#timerPollingRef);
                    }
                    onError?.({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
                }
            }
        }
        catch (e) {
            if (this.#timerPollingRef) {
                clearInterval(this.#timerPollingRef);
            }
            onError?.(e);
        }
    }
    #handlePolling(options) {
        const { scanId, onSuccess, onError } = options;
        if (this.#timerPollingRef) {
            clearInterval(this.#timerPollingRef);
        }
        this.#timerPollingRef = setTimeout(() => {
            this.#getMeasurementsCheck({ scanId, onSuccess, onError });
        }, this.#count * 5000);
    }
    #disconnectSocket() {
        this.#measurementSocketRef?.close();
        if (this.#timerWaitingRef) {
            clearTimeout(this.#timerWaitingRef);
        }
    }
    #handleTimeOut(options) {
        const { scanId, onSuccess, onError } = options;
        this.#count = 1;
        this.#timerWaitingRef = setTimeout(() => {
            this.#handlePolling({ scanId, onSuccess, onError });
            this.#disconnectSocket();
        }, 2 * 60000);
    }
    handleMeasurementSocket(options) {
        const { scanId, onError, onSuccess, onClose, onOpen } = options;
        if (!checkParameters(scanId)) {
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
                }
                else {
                    onError?.(data);
                }
                if (this.#timerWaitingRef) {
                    clearTimeout(this.#timerWaitingRef);
                }
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
