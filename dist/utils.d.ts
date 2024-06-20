import { ObjMetaData } from "./constants.js";
export interface FetchDataOptions {
    path: string;
    body?: any;
    queryParams?: string;
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    throwError?: boolean;
    stagingUrl: boolean;
}
export declare function fetchData(options: FetchDataOptions): Promise<any>;
export declare function checkParameters(...args: any[]): boolean;
export declare function checkMetaDataValue(arr: Partial<ObjMetaData>[]): boolean;
export declare const addScanType: (arr: Partial<ObjMetaData>[], scan_id: string) => Partial<ObjMetaData>[];
export declare function getFileChunks(file: File, chunkSize?: number): Blob[];
export declare const getUrl: ({ urlName, stagingUrl }: {
    urlName: string;
    stagingUrl: boolean;
}) => string;
export declare const isValidEmail: (email: string) => boolean;
