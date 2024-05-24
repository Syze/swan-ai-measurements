import { ObjMetaData } from "./constants.js";
export interface FetchDataOptions {
    path: string;
    body?: any;
    queryParams?: string;
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    throwError?: boolean;
}
export declare function fetchData(options: FetchDataOptions): Promise<any>;
export declare function checkParameters(...args: any[]): boolean;
export declare function checkMetaDataValue(arr: ObjMetaData[]): boolean;
export declare function getFileChunks(file: File, chunkSize?: number): Blob[];
