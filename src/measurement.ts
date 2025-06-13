import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";

interface MeasurementRecommendation {
	shopDomain: string;
	scanId: string;
	productName: string;
}
interface Callbacks {
	onError?: (error: any) => void;
	onSuccess?: (data: any) => void;
	onClose?: () => void;
	onOpen?: () => void;
}
interface MeasurementSocketOptions extends Callbacks {
	scanId: string;
}
interface FaceScanSocketOptions extends Callbacks {
	faceScanId: string;
}
interface HandleSocket extends Callbacks {
	isFallback: boolean;
	scanId?: string;
	faceScanId?: string;
	paramsKey?: string;
	delay:number
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

	getMeasurementRecommendation({ scanId, shopDomain, productName }: MeasurementRecommendation): Promise<AxiosResponse<any>> {
		if (!checkParameters(scanId, shopDomain, productName)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.RECOMMENDATION}/scan/${scanId}/shop/${shopDomain}/product/${productName}`, {
			headers: { "X-Api-Key": this.#accessKey },
		});
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
		this.#handleSocket({ onOpen, scanId, onSuccess, onError, onClose, paramsKey: "scanId", isFallback: true,delay:5000 });
	}
	handlFaceScaneSocket(options: FaceScanSocketOptions): void {
		const { faceScanId, onError, onSuccess, onClose, onOpen } = options;

		if (!checkParameters(faceScanId)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		this.#handleSocket({ onOpen, faceScanId, onSuccess, onError, onClose, paramsKey: "faceScanId", isFallback: false,delay:0 });
	}
	#handleSocket({ onOpen, isFallback, scanId, onSuccess, onError, onClose, paramsKey, faceScanId,delay }: HandleSocket) {
		setTimeout(() => {
			this.#disconnectSocket();
			const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.SCANNING}?${paramsKey}=${scanId || faceScanId}`;
			this.#measurementSocketRef = new WebSocket(url);
			this.#measurementSocketRef.onopen = () => {
				onOpen?.();
				if (isFallback && scanId) {
					this.#handleTimeOut({ scanId, onSuccess, onError });
				}
			};

			this.#measurementSocketRef.onmessage = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				if (data?.code === 200 && data?.scanStatus === "success") {
					onSuccess?.(data);
				} else {
					if (this.#timerWaitingRef) {
						clearTimeout(this.#timerWaitingRef);
					}
					onError?.(data);
				}
				if (this.#timerWaitingRef && data?.code === 200 && data?.scanStatus === "success" && data?.resultType === "final") {
					clearTimeout(this.#timerWaitingRef);
				}
			};

			this.#measurementSocketRef.onclose = () => {
				onClose?.();
			};

			this.#measurementSocketRef.onerror = (event: Event) => {
				// onError?.(event);
			};
		}, delay);
	}
}

export default Measurement;
