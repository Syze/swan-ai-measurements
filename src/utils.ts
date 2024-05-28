import axios, { AxiosResponse } from "axios";
import { APP_AUTH_BASE_URL, ObjMetaData, PROD_URL, STAGING_URL, requiredMetaData } from "./constants.js";

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

export async function fetchData(options: FetchDataOptions): Promise<any> {
  const {
    path,
    body,
    queryParams,
    baseUrl = APP_AUTH_BASE_URL,
    apiKey = "",
    throwError = false,
    headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" },
    stagingUrl = false,
  } = options;

  const apiUrl = `${getUrl({ urlName: baseUrl, stagingUrl: stagingUrl })}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
  try {
    const res: AxiosResponse<any> = await axios.post(apiUrl, body, { headers });
    if (res.status >= 200 && res.status < 300) {
      return res.data;
    }
    console.error(`Error: Unexpected response status ${res.status}`);
    if (throwError) {
      throw new Error(`Failed to upload`);
    }
    return {};
  } catch (error: any) {
    console.error(error, "while uploading");
    if (throwError) {
      throw new Error(`Failed to upload: ${error?.message || "something went wrong"}`);
    }
    return {};
  }
}

export function checkParameters(...args: any[]): boolean {
  for (const element of args) {
    if (!element) {
      return false;
    }
  }
  return true;
}

export function checkMetaDataValue(arr: Partial<ObjMetaData>[]): boolean {
  for (const key of requiredMetaData) {
    let hasRequiredKey = false;
    for (const obj of arr) {
      if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null && obj[key] !== "" && typeof obj[key] !== "number") {
        hasRequiredKey = true;
        break;
      }
    }
    if (!hasRequiredKey) {
      return false;
    }
  }
  let correctFormat = false;
  for (const obj of arr) {
    if (obj.callback_url && obj.callback_url.startsWith("https")) {
      correctFormat = true;
    }
  }
  if (!correctFormat) {
    return false;
  }
  return true;
}

export const addScanType = (arr: Partial<ObjMetaData>[], scan_id: string): Partial<ObjMetaData>[] => {
  for (const obj of arr) {
    if (!obj.scan_type) {
      arr.push({ scan_type: "clothing_custom_scan" });
    }
  }
  arr.push({ scan_id });
  return arr;
};

export function getFileChunks(file: File, chunkSize = 5 * 1024 * 1024): Blob[] {
  const totalSize = file.size;
  const chunks = [];
  let start = 0;
  while (start < totalSize) {
    chunks.push(file.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

export const getUrl = ({ urlName, stagingUrl = false }: { urlName: string; stagingUrl: boolean }) => {
  if (stagingUrl) {
    return STAGING_URL[urlName];
  }
  return PROD_URL[urlName];
};
