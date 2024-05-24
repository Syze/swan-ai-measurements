import axios, { AxiosResponse } from "axios";
import { APP_AUTH_BASE_URL, ObjMetaData, requiredMetaData } from "./constants.js";

export interface FetchDataOptions {
  path: string;
  body?: any;
  queryParams?: string;
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export async function fetchData(options: FetchDataOptions): Promise<any> {
  const {
    path,
    body,
    queryParams,
    baseUrl = APP_AUTH_BASE_URL,
    apiKey = "",
    headers = { "X-Api-Key": apiKey, "Content-Type": "application/json" },
  } = options;
  console.log(body, "body", path, "path");

  const apiUrl = `${baseUrl}${path}${queryParams ? `?${new URLSearchParams(queryParams)}` : ""}`;
  try {
    const res: AxiosResponse<any> = await axios.post(apiUrl, body, { headers });
    if (res.status >= 200 && res.status < 300) {
      return res.data;
    }
    console.error(`Error: Unexpected response status ${res.status}`);
    return {};
  } catch (error) {
    console.error(error, "while uploading");
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
