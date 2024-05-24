import { ObjMetaData } from "./constants.js";
export interface FetchDataOptions {
    path: string;
    body?: any;
    queryParams?: string;
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    timeout?: number;
}
export declare function fetchData(options: FetchDataOptions): Promise<any>;
export declare function checkParameters(...args: any[]): boolean;
export declare function checkMetaDataValue(arr: ObjMetaData[]): boolean;
