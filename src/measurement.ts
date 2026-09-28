import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";
import { URLType } from "./enum.js";

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
	onPreopen?: () => void;
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
	/**
	 * Handles for the deferred opens in #handleSocket.
	 *
	 * The socket is created after a delay (5s for measurement, 1s for face), so
	 * between the call and that timer firing there is nothing to close. Without
	 * this, closing in that window is a no-op and the socket opens afterwards
	 * anyway — which is exactly what a quick retry does.
	 */
	#openTimers: Record<string, NodeJS.Timeout | null> = {};
	#accessKey?: string;
	#urlType: URLType;
	#token?: string;

	constructor(accessKey?: string, urlType = URLType.PROD, token?: string) {
		this.#accessKey = accessKey;
		this.#urlType = urlType;
		this.#token = token;
	}

	#getHeaders(): Record<string, string> {
		return {
			...(this.#accessKey ? { "X-Api-Key": this.#accessKey } : {}),
			...(this.#token ? { Authorization: `Bearer ${this.#token}` } : {}),
		};
	}

	getMeasurementResult(scanId: string): Promise<AxiosResponse<any>> {
		if (!checkParameters(scanId)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}/measurements?scanId=${scanId}`;
		return axios.get(url, {
			headers: this.#getHeaders(),
		});
	}

	getMeasurementRecommendation({ scanId, shopDomain, productName }: MeasurementRecommendation): Promise<AxiosResponse<any>> {
		if (!checkParameters(scanId, shopDomain, productName)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.RECOMMENDATION}/scan/${scanId}/shop/${shopDomain}/product/${productName}`, {
			headers: this.#getHeaders(),
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

	/**
	 * Everything holding a scan open: the pending open, the socket, the fallback
	 * timer and the polling timer.
	 *
	 * Deliberately separate from #disconnectSocket rather than folded into it.
	 * #handleTimeOut starts polling and *then* calls #disconnectSocket, so a
	 * version of that method which also cleared #pollingTimers would cancel the
	 * polling it had just scheduled — the fallback would silently stop working.
	 */
	#closeSocketAndTimers(key: string): void {
		if (this.#openTimers[key]) {
			clearTimeout(this.#openTimers[key]!);
			this.#openTimers[key] = null;
		}
		this.#disconnectSocket(key);
		if (this.#pollingTimers[key]) {
			clearTimeout(this.#pollingTimers[key]!);
			this.#pollingTimers[key] = null;
		}
		this.#pollingCounts[key] = 1;
	}

	/**
	 * Releases everything held for one body scan.
	 *
	 * Callers own the lifetime, because only they know when a result is final.
	 * The client cannot tell: a socket that has delivered a final frame looks the
	 * same as one still waiting, and closing on the caller's behalf would cut off
	 * the late result that is the only signal a scan failed after the user moved
	 * on. Safe to call more than once, and for a scan that never opened a socket.
	 */
	closeMeasurementSocket(scanId: string): void {
		if (!scanId) return;
		this.#closeSocketAndTimers(`measurement-${scanId}`);
	}

	/** As closeMeasurementSocket, for a face scan. */
	closeFaceScanSocket(faceScanId: string): void {
		if (!faceScanId) return;
		this.#closeSocketAndTimers(`faceScan-${faceScanId}`);
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
			} else if (res?.data?.failureReason) {
				this.#pollingCounts[key] = 1;
				clearInterval(this.#pollingTimers[key]!);
				onError?.({ scanStatus: "failed", message: res.data.failureReason, isMeasured: false });
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

	#handleSocket({ onOpen, isFallback, scanId, onSuccess, onError, onClose, paramsKey, faceScanId, delay, onPreopen }: HandleSocket) {
		const key = isFallback ? `measurement-${scanId}` : `faceScan-${faceScanId}`;
		this.#openTimers[key] = setTimeout(() => {
			this.#openTimers[key] = null;
			this.#disconnectSocket(key);
			onPreopen?.()
			const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, urlType: this.#urlType })}${API_ENDPOINTS.SCANNING}?${paramsKey}=${scanId || faceScanId}`;
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
					onError?.(data);
				}
				clearTimeout(this.#waitingTimers[key]!);
			};

			socket.onclose = () => onClose?.();
			socket.onerror = () => {
				if (!isFallback) {
					onError?.(new Error("An error occurred in the WebSocket connection."));
				}
			};
		}, delay);
	}
}

export default Measurement;
