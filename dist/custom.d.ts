import { AxiosResponse } from "axios";
declare class Custom {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    createCustomer(payload: {
        name: string;
        store_url: string;
        location: string;
        email: string;
        emailsTier_1: string;
        emailsTier_2: string;
    }): Promise<AxiosResponse<any>>;
    getCustomCustomerConfig: (store_url: string) => Promise<AxiosResponse<any>>;
    getModelUrl: (id: string) => Promise<AxiosResponse<any>>;
}
export default Custom;
