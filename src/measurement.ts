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
	delay: number;
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
	#socketRefs: Record<string, WebSocket | null> = {};
	#waitingTimers: Record<string, NodeJS.Timeout | null> = {};
	#pollingTimers: Record<string, NodeJS.Timeout | null> = {};
	#pollingCounts: Record<string, number> = {};
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

	#disconnectSocket(key: string): void {
		this.#socketRefs[key]?.close();
		this.#socketRefs[key] = null;
		if (this.#waitingTimers[key]) {
			clearTimeout(this.#waitingTimers[key]!);
			this.#waitingTimers[key] = null;
		}
	}

	#handleTimeOut(options: HandleTimeOutOptions, key: string): void {
		const { scanId, onSuccess, onError } = options;
		this.#pollingCounts[key] = 1;
		this.#waitingTimers[key] = setTimeout(() => {
			this.#handlePolling({ scanId, onSuccess, onError }, key);
			this.#disconnectSocket(key);
		}, 1.5 * 60000);
	}

	#handlePolling(options: HandlePollingOptions, key: string): void {
		const { scanId, onSuccess, onError } = options;
		if (this.#pollingTimers[key]) {
			clearTimeout(this.#pollingTimers[key]!);
		}
		this.#pollingTimers[key] = setTimeout(() => {
			this.#getMeasurementsCheck({ scanId, onSuccess, onError }, key);
		}, (this.#pollingCounts[key] || 1) * 5000);
	}

	async #getMeasurementsCheck(options: GetMeasurementsCheckOptions, key: string): Promise<void> {
		const { scanId, onSuccess, onError } = options;
		try {
			const res = await this.getMeasurementResult(scanId);
			if (res?.data && res?.data?.isMeasured === true) {
				onSuccess?.(res.data);
				clearInterval(this.#pollingTimers[key]!);
			} else {
				if ((this.#pollingCounts[key] || 1) < 8) {
					this.#pollingCounts[key] = (this.#pollingCounts[key] || 1) + 1;
					this.#handlePolling({ scanId, onSuccess, onError }, key);
				} else {
					this.#pollingCounts[key] = 1;
					clearInterval(this.#pollingTimers[key]!);
					onError?.({ scanStatus: "failed", message: "Scan not found", isMeasured: false });
				}
			}
		} catch (e) {
			clearInterval(this.#pollingTimers[key]!);
			onError?.(e);
		}
	}

	handleMeasurementSocket(options: MeasurementSocketOptions): void {
		const { scanId, onError, onSuccess, onClose, onOpen } = options;
		if (!checkParameters(scanId)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		this.#handleSocket({ onOpen, scanId, onSuccess, onError, onClose, paramsKey: "scanId", isFallback: true, delay: 5000 });
	}

	handlFaceScaneSocket(options: FaceScanSocketOptions): void {
		const { faceScanId, onError, onSuccess, onClose, onOpen } = options;
		if (!checkParameters(faceScanId)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		this.#handleSocket({ onOpen, faceScanId, onSuccess, onError, onClose, paramsKey: "faceScanId", isFallback: false, delay: 1000 });
	}

	#handleSocket({ onOpen, isFallback, scanId, onSuccess, onError, onClose, paramsKey, faceScanId, delay }: HandleSocket) {
		const key = isFallback ? `measurement-${scanId}` : `faceScan-${faceScanId}`;
		setTimeout(() => {
			this.#disconnectSocket(key);
			const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.SCANNING}?${paramsKey}=${scanId || faceScanId}`;
			const socket = new WebSocket(url);
			this.#socketRefs[key] = socket;

			socket.onopen = () => {
				onOpen?.();
				if (isFallback && scanId) {
					this.#handleTimeOut({ scanId, onSuccess, onError }, key);
				}
			};

			socket.onmessage = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				if (data?.code === 200 && data?.scanStatus === "success") {
					onSuccess?.(data);
				} else {
					clearTimeout(this.#waitingTimers[key]!);
					onError?.(data);
				}
				if (data?.code === 200 && data?.scanStatus === "success" && data?.resultType === "final") {
					clearTimeout(this.#waitingTimers[key]!);
				}
			};

			socket.onclose = () => onClose?.();
			socket.onerror = () => {};
		}, delay);
	}
}

export default Measurement;
