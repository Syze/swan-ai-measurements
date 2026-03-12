import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";
import { URLType } from "./enum.js";


interface RegisterUserParams {
	email: string;
	appVerifyUrl: string;
	gender?: string;
	height?: number;
	username?: string;
}

interface AddUserParams {
	scanId: string;
	email: string;
	name?: string;
	height: number;
	gender: string;
	offsetMarketingConsent?: boolean;
}

interface AuthSocketParams {
	email: string;
	scanId: string;
	onError?: (event: Event) => void;
	onSuccess?: (data: any) => void;
	onClose?: () => void;
	onOpen?: () => void;
}

interface AuthSocketDetail {
	email: string;
	scanId: string;
}

export default class Auth {
	#socketRef?: WebSocket;
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

	registerUser({ email, appVerifyUrl, gender, height, username }: RegisterUserParams): Promise<AxiosResponse> {
		if (!checkParameters(email, appVerifyUrl)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		let body: Record<string, any> = { username, email, appVerifyUrl };
		if (gender && height) {
			body = { ...body, attributes: { gender, height } };
		}
		return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.REGISTER_USER}`, body, {
			headers: this.#getHeaders(),
		});
	}

	verifyToken(token: string): Promise<AxiosResponse> {
		if (!checkParameters(token)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.VERIFY_USER}`, null, {
			params: { token },
			headers: this.#getHeaders(),
		});
	}

	addUser({ scanId, email, name, height, gender, offsetMarketingConsent }: AddUserParams): Promise<AxiosResponse> {
		if (!checkParameters(scanId, email, height, gender)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.post(
			`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.ADD_USER}`,
			{ scan_id: scanId, email, name, offsetMarketingConsent, attributes: JSON.stringify({ height, gender }) },
			{ headers: this.#getHeaders() },
		);
	}

	userProfile(): Promise<AxiosResponse> {
		return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.USER_PROFILE}`, {
			headers: this.#getHeaders(),
		});
	}

	userExists(): Promise<AxiosResponse> {
		return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.USER_EXISTS}`, {
			headers: this.#getHeaders(),
		});
	}

	getUserDetail(email: string): Promise<AxiosResponse> {
		if (!checkParameters(email)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`, {
			headers: this.#getHeaders(),
		});
	}

	handleAuthSocket({ email, scanId, onError, onSuccess, onClose, onOpen }: AuthSocketParams): void {
		if (!checkParameters(email, scanId)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		if (this.#socketRef) this.#socketRef.close();

		this.#socketRef = new WebSocket(`${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, urlType: this.#urlType })}${API_ENDPOINTS.AUTH}`);
		const detailObj: AuthSocketDetail = { email, scanId };
		if (this.#socketRef) {
			this.#socketRef.onopen = () => {
				this.#socketRef?.send(JSON.stringify(detailObj));
				onOpen?.();
			};

			this.#socketRef.onmessage = (event: MessageEvent) => {
				let data;
				try {
					data = JSON.parse(event.data);
				} catch (error) {
					console.log(data, error, "noy correct format for data");

					return;
				}
				data = JSON.parse(event.data);
				onSuccess?.(data);
			};

			this.#socketRef.onclose = () => {
				onClose?.();
			};

			this.#socketRef.onerror = (event: Event) => {
				onError?.(event);
			};
		}
	}
}
