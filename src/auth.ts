import axios, { AxiosResponse } from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, APP_BASE_URL, REQUIRED_MESSAGE } from "./constants";
import { checkParameters } from "./utils";

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
  #accessKey: string;

  constructor(accessKey: string) {
    this.#accessKey = accessKey;
  }

  registerUser({ email, appVerifyUrl, gender, height, username }: RegisterUserParams): Promise<AxiosResponse> {
    if (!checkParameters(email, appVerifyUrl)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    let body: Record<string, any> = { username, email, appVerifyUrl };
    if (gender && height) {
      body = { ...body, attributes: { gender, height } };
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.REGISTER_USER}`, body, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  verifyToken(token: string): Promise<AxiosResponse> {
    if (!checkParameters(token)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.VERIFY_USER}`, null, {
      params: { token },
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  addUser({ scanId, email, name, height, gender, offsetMarketingConsent }: AddUserParams): Promise<AxiosResponse> {
    if (!checkParameters(scanId, email, height, gender)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.post(
      `${APP_AUTH_BASE_URL}${API_ENDPOINTS.ADD_USER}`,
      { scan_id: scanId, email, name, offsetMarketingConsent, attributes: JSON.stringify({ height, gender }) },
      { headers: { "X-Api-Key": this.#accessKey } }
    );
  }

  getUserDetail(email: string): Promise<AxiosResponse> {
    if (!checkParameters(email)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return axios.get(`${APP_BASE_URL}${API_ENDPOINTS.GET_USER_DETAIL}/${email}`, {
      headers: { "X-Api-Key": this.#accessKey },
    });
  }

  handleAuthSocket({ email, scanId, onError, onSuccess, onClose, onOpen }: AuthSocketParams): void {
    if (!checkParameters(email, scanId)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if (this.#socketRef) this.#socketRef.close();

    this.#socketRef = new WebSocket(`${APP_AUTH_WEBSOCKET_URL}${API_ENDPOINTS.AUTH}`);
    const detailObj: AuthSocketDetail = { email, scanId };

    this.#socketRef.onopen = () => {
      this.#socketRef?.send(JSON.stringify(detailObj));
      onOpen?.();
    };

    this.#socketRef.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
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
