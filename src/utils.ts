import axios, { AxiosResponse } from "axios";
import { APP_AUTH_BASE_URL, BodyScanObjMetaData,URLS, requiredMetaData } from "./constants.js";
import { URLType } from "./enum.js";

export interface FetchDataOptions {
  path: string;
  body?: any;
  queryParams?: string;
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  throwError?: boolean;
  urlType: URLType;
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
    urlType = URLType.PROD,
  } = options;

  const apiUrl = `${getUrl({ urlName: baseUrl, urlType })}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
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

export function checkMetaDataValue(arr: Partial<BodyScanObjMetaData>[]): boolean {
  if (!checkValues(arr, requiredMetaData)) {
    return false;
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

export const checkValues=(arr:any[],requiredMetaData:any)=>{
  for (const key of requiredMetaData) {
    let hasRequiredKey = false;
    for (const obj of arr) {
      if (
        Object.prototype.hasOwnProperty.call(obj, key) &&
        (obj as Record<string, unknown>)[key] !== undefined &&
        (obj as Record<string, unknown>)[key] !== null &&
        (obj as Record<string, unknown>)[key] !== "" &&
        typeof (obj as Record<string, unknown>)[key] !== "number"
      ) {
        hasRequiredKey = true;
        break;
      }
    }
    if (!hasRequiredKey) {
      return false;
    }
  }
  return true
}

export const addScanType = (arr: Partial<BodyScanObjMetaData>[], scan_id: string, email: string): Partial<BodyScanObjMetaData>[] => {
  const scanType = arr.find((el) => el.scan_type);
  if (!scanType) {
    arr.push({ scan_type: "clothing_scan" });
  }
  arr.push({ scan_id });
  arr.push({ email });
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

export const getUrl = ({ urlName, urlType = URLType.STAGING }: { urlName: string; urlType: URLType }) => {
  return URLS[urlType][urlName]

};

export const isValidEmail = (email: string) => {
  const checkEmailValidation =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return checkEmailValidation.test(email);
};
