import { AxiosResponse } from "axios";
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
export default class Auth {
    #private;
    constructor(accessKey?: string, urlType?: URLType, token?: string);
    registerUser({ email, appVerifyUrl, gender, height, username }: RegisterUserParams): Promise<AxiosResponse>;
    verifyToken(token: string): Promise<AxiosResponse>;
    addUser({ scanId, email, name, height, gender, offsetMarketingConsent }: AddUserParams): Promise<AxiosResponse>;
    userProfile(): Promise<AxiosResponse>;
    userExists(): Promise<AxiosResponse>;
    getUserDetail(email: string): Promise<AxiosResponse>;
    handleAuthSocket({ email, scanId, onError, onSuccess, onClose, onOpen }: AuthSocketParams): void;
}
export {};
