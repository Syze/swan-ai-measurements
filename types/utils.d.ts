export function checkMetaDataValue(arr: any): boolean;
export function checkParameters(...args: any[]): boolean;
export function fetchData({ path, body, queryParams, baseUrl, apiKey, headers, }: {
    path: any;
    body: any;
    queryParams: any;
    baseUrl?: string;
    apiKey?: string;
    headers?: {
        "X-Api-Key": any;
        "Content-Type": string;
    };
}): Promise<any>;
