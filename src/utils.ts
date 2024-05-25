import axios, { AxiosError, AxiosResponse } from "axios";
import { APP_AUTH_BASE_URL, ObjMetaData, requiredMetaData } from "./constants.js";

export interface FetchDataOptions {
  path: string;
  body?: any;
  queryParams?: string;
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  throwError?: boolean;
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
  } = options;

  const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
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

export function checkMetaDataValue(arr: ObjMetaData[]): boolean {
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

export function getFileChunks(file: File, chunkSize = 5 * 1024 * 1024) {
  const totalSize = file.size;
  const chunks = [];
  let start = 0;
  while (start < totalSize) {
    chunks.push(file.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}
