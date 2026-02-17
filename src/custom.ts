import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl } from "./utils.js";
import { URLType } from "./enum.js";

interface CreateCustomer {
	name: string;
	storeUrl: string;
	location: string;
	email: string;
	emailsTier_1?: string;
	emailsTier_2?: string;
}
class Custom {
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

	createCustomer(payload: CreateCustomer): Promise<AxiosResponse<any>> {
		if (checkParameters(payload.name, payload.storeUrl, payload.email, payload.location) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.CREATE_CUSTOMER}`, payload, {
			headers: this.#getHeaders(),
		});
	}

	getCustomCustomerConfig: (store_url: string) => Promise<AxiosResponse<any>> = (store_url: string) => {
		if (checkParameters(store_url) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.get(
			`${getUrl({
				urlName: APP_AUTH_BASE_URL,
				urlType: this.#urlType,
			})}${API_ENDPOINTS.CUSTOM_CUSTOMER}`,
			{
				params: { store_url },
				headers: this.#getHeaders(),
			},
		);
	};

	getModelUrl: (id: string) => Promise<AxiosResponse<any>> = (id: string) => {
		if (checkParameters(id) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.get(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.MODEL}/${id}`, {
			headers: this.#getHeaders(),
		});
	};
}

export default Custom;
