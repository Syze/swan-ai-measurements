import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_BASE_WEBSOCKET_URL, REQUIRED_ERROR_MESSAGE_INVALID_EMAIL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters, getUrl, isValidEmail } from "./utils.js";
import { URLType } from "./enum.js";

interface UploadFileParams {
	files: File[];
	userEmail: string;
	fileNoLimit?: number;
}

interface DeleteImageParams {
	userEmail: string;
	fileName: string;
}
interface EligibiltyImageParams {
	storeUrl: string;
	productHandle: string;
	imageURL: string;
	productDescription: string;
}
interface HandleTryOnWebSocketParams {
	tryonId: string;
	onError?: (error: any) => void;
	onSuccess?: (data: any) => void;
	onClose?: () => void;
	onOpen?: () => void;
}
interface Products {
	productUrl: string;
	productHandle: string;
	openTryonId?: string;
	selectedProductImageUrl?: string;
}

interface HandleForLatestImageParams {
	shopDomain: string;
	products: Products[];
	selectedUserImages?: string[];
	requestSource?: string;
	callbackUrl?: string;
	openTryonId?: string;
	selectedProductImageUrl?: string;
	token: string;
	requestedTryonViews?: string[];
}

interface HandleTimeOutParams {
	onSuccess?: (data: any) => void;
	onError?: (error: any) => void;
	tryonId: string;
}

interface GetTryOnResultParams {
	tryonId: string;
}

class TryOn {
  #socketMap: Map<string, WebSocket> = new Map();
  #timerMap: Map<string, ReturnType<typeof setTimeout>> = new Map();
  

	#accessKey: string;
	#urlType: URLType;
	constructor(accessKey: string, urlType = URLType.PROD) {
		this.#accessKey = accessKey;
		this.#urlType = urlType;
	}

	async uploadFile({ files, userEmail, fileNoLimit = 2 }: UploadFileParams): Promise<string> {
		if (checkParameters(files, userEmail) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}

		if (!isValidEmail(userEmail.trim())) {
			throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
		}
		if (fileNoLimit <= 0) {
			throw new Error(`Provide valid file number limit ${fileNoLimit}.`);
		}
		if (files?.length > fileNoLimit) {
			throw new Error(`Cannot allow more than ${fileNoLimit} files.`);
		}
		try {
			const payload: { userEmail: string; userImages: string[] } = {
				userEmail,
				userImages: [],
			};
			files?.forEach((file: File) => {
				payload.userImages.push(file.name);
			});
			const signedUrlRes = await this.#getSignedUrl(payload);
			for (const file of files) {
				await this.#s3Upload(signedUrlRes.data.uploadUrls[file.name].url, file);
			}
			return `uploaded successfully!`;
		} catch (error) {
			throw error;
		}
	}

	#getSignedUrl(payload: { userEmail: string; userImages: string[] }): Promise<AxiosResponse<any>> {
		if (checkParameters(payload) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
			headers: {
				"Content-Type": "application/json",
				"X-Api-Key": this.#accessKey,
			},
		});
	}

	#s3Upload(url: string, file: File): Promise<AxiosResponse<any>> {
		if (checkParameters(url, file) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.put(url, file, {
			headers: {
				"Content-Type": file.type,
			},
		});
	}

	getUploadedFiles(userEmail: string): Promise<AxiosResponse<any>> {
		if (checkParameters(userEmail) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		if (!isValidEmail(userEmail.trim())) {
			throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
		}

		const payload = {
			userEmail,
		};

		return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}`, payload, {
			headers: { "X-Api-Key": this.#accessKey },
		});
	}

	deleteImage({ userEmail, fileName }: DeleteImageParams): Promise<AxiosResponse<any>> {
		if (checkParameters(userEmail, fileName) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		if (!isValidEmail(userEmail.trim())) {
			throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
		}
		const payload = {
			userEmail,
			file: fileName,
		};
		return axios.delete(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON_IMAGE_URLS}`, {
			headers: { "X-Api-Key": this.#accessKey },
			data: payload,
		});
	}

  #disconnectSocket = (tryonId?: string): void => {
    if (tryonId) {
      const socket = this.#socketMap.get(tryonId);
      const timer = this.#timerMap.get(tryonId);
      socket?.close();
      if (timer) clearTimeout(timer);
      this.#socketMap.delete(tryonId);
      this.#timerMap.delete(tryonId);
    } else {
      // Disconnect all
      this.#socketMap.forEach((socket) => socket.close());
      this.#timerMap.forEach((timer) => clearTimeout(timer));
      this.#socketMap.clear();
      this.#timerMap.clear();
    }
  };
  

  #handleTimeOut = ({ onSuccess, onError, tryonId }: HandleTimeOutParams): void => {
    const timer = setTimeout(() => {
      this.#handleGetTryOnResult({ onSuccess, onError, tryonId });
      this.#disconnectSocket(tryonId);
    }, 300000);
    this.#timerMap.set(tryonId, timer);
  };
  

  handleTryOnWebSocket = ({ tryonId, onError, onSuccess, onClose, onOpen }: HandleTryOnWebSocketParams): void => {
    if (checkParameters(tryonId) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
  
    this.#disconnectSocket(tryonId);
  
    const url = `${getUrl({ urlName: APP_BASE_WEBSOCKET_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON}?tryonId=${tryonId}`;
    const socket = new WebSocket(url);
  
    this.#socketMap.set(tryonId, socket);
  
    socket.onopen = () => {
      onOpen?.();
      this.#handleTimeOut({ onSuccess, onError, tryonId });
    };
  
    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.log("Invalid JSON:", event.data);
        return;
      }
  
      if (data?.eventType === "tryon.completed") {
        onSuccess?.(data);
      } else if (data?.eventType=="tryon.failed") {
		onError?.(data);
	  }
  
      const timer = this.#timerMap.get(tryonId);
      if (timer) clearTimeout(timer);
      this.#timerMap.delete(tryonId);
    };
  
    socket.onclose = () => {
      onClose?.();
      // this.#disconnectSocket(tryonId);
    };
  
    socket.onerror = (event) => {
      onError?.(event);
      // const timer = this.#timerMap.get(tryonId);
      // if (timer) clearTimeout(timer);
      // this.#timerMap.delete(tryonId);
    };
  };
  

	handleTryOnSubmit({ shopDomain, products, selectedUserImages, requestSource, callbackUrl, openTryonId, selectedProductImageUrl, token ,requestedTryonViews}: HandleForLatestImageParams): Promise<AxiosResponse<any>> {
		if (checkParameters(shopDomain, products, token) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}

		const payload = {
			products,
			customerStoreUrl: shopDomain,
			...(selectedUserImages !== undefined && selectedUserImages !== null && { selectedUserImages }),
			...(requestSource !== undefined && requestSource !== null && { requestSource }),
			...(callbackUrl !== undefined && callbackUrl !== null && { callbackUrl }),
			...(openTryonId !== undefined && openTryonId !== null && { openTryonId }),
			...(selectedProductImageUrl !== undefined && selectedProductImageUrl !== null && { selectedProductImageUrl }),
			...(requestedTryonViews && requestedTryonViews?.length > 0 && { requestedTryonViews }),
		};
		const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON}`;
		const headers: Record<string, string> = { "X-Api-Key": this.#accessKey };
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}
		return axios.post(url, payload, {
			headers,
		});
	}

	#handleGetTryOnResult = async ({ onSuccess, onError, tryonId }: HandleTimeOutParams): Promise<void> => {
		try {
			const data = await this.getTryOnResult({ tryonId });
			onSuccess?.(data.data);
		} catch (error) {
			onError?.(error);
		}
	};

	getShareLink(tryonId: string) {
		return axios.post(
			`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON_SHARE}`,
			{ tryonId },
			{
				headers: { "X-Api-Key": this.#accessKey },
			},
		);
	}

	getTryOnResult = ({ tryonId }: GetTryOnResultParams): Promise<AxiosResponse<any>> => {
		if (checkParameters(tryonId) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}/${tryonId}`;
		return axios.post(url, null, {
			headers: { "X-Api-Key": this.#accessKey },
		});
	};

	getProductImageEligibility({ storeUrl, productHandle, imageURL, productDescription }: EligibiltyImageParams) {
		if (checkParameters(storeUrl, productHandle, imageURL) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		const payload = { storeUrl, productHandle, imageURL, productDescription: productDescription ?? null };
		const url = `${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: this.#urlType })}${API_ENDPOINTS.TRY_ON_PRODUCT_IMAGE_ELIGIBILTY}`;
		return axios.post(url, payload, {
			headers: { "X-Api-Key": this.#accessKey },
		});
	}
}

export default TryOn;
