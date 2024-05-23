import { AxiosResponse } from "axios";
declare class Custom {
    #private;
    constructor(accessKey: string);
    getCustomCustomerConfig: (store_url: string) => Promise<AxiosResponse<any>>;
    getModelUrl: (id: string) => Promise<AxiosResponse<any>>;
}
export default Custom;
