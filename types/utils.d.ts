export function fetchData({ path, body, queryParams, baseUrl, apiKey, headers, }: {
    path: any;
    body: any;
    queryParams: any;
    baseUrl?: string | undefined;
    apiKey?: string | undefined;
    headers?: {
        "X-Api-Key": any;
        "Content-Type": string;
    } | undefined;
}): Promise<any>;
export function checkParameters(...args: any[]): boolean;
export function checkMetaDataValue(arr: any): boolean;
