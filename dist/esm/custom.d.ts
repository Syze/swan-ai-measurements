import { AxiosResponse } from "axios";
interface CreateCustomer {
    name: string;
    storeUrl: string;
    location: string;
    email: string;
    emailsTier_1?: string;
    emailsTier_2?: string;
}
declare class Custom {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    createCustomer(payload: CreateCustomer): Promise<AxiosResponse<any>>;
    getCustomCustomerConfig: (store_url: string) => Promise<AxiosResponse<any>>;
    getModelUrl: (id: string) => Promise<AxiosResponse<any>>;
}
export default Custom;
