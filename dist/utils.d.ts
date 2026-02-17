import { BodyScanObjMetaData } from "./constants.js";
import { URLType } from "./enum.js";
export interface FetchDataOptions {
    path: string;
    body?: any;
    queryParams?: string;
    baseUrl?: string;
    apiKey?: string;
    token?: string;
    headers?: Record<string, string>;
    throwError?: boolean;
    urlType: URLType;
}
export declare function fetchData(options: FetchDataOptions): Promise<any>;
export declare function checkParameters(...args: any[]): boolean;
export declare function checkMetaDataValue(arr: Partial<BodyScanObjMetaData>[]): boolean;
export declare const checkValues: (arr: any[], requiredMetaData: any) => boolean;
export declare const addScanType: (arr: Partial<BodyScanObjMetaData>[], scan_id: string, email: string) => Partial<BodyScanObjMetaData>[];
export declare function getFileChunks(file: File, chunkSize?: number): Blob[];
export declare const getUrl: ({ urlName, urlType }: {
    urlName: string;
    urlType: URLType;
}) => string;
export declare const isValidEmail: (email: string) => boolean;
