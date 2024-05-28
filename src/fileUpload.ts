import axios from "axios";
import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, FILE_UPLOAD_ENDPOINT, APP_AUTH_BASE_URL } from "./constants.js";
import { addScanType, checkMetaDataValue, checkParameters, fetchData, getFileChunks, getUrl } from "./utils.js";
const Uppy = require("fix-esm").require("@uppy/core");
const AwsS3Multipart = require("fix-esm").require("@uppy/aws-s3-multipart");
interface ObjMetaData {
  gender: string;
  scan_id?: string;
  email: string;
  focal_length: string;
  height: string;
  customer_store_url: string;
  clothes_fit: string;
  scan_type?: string;
  callback_url: string;
}

interface UploadOptions {
  file: File;
  arrayMetaData: Partial<ObjMetaData>[];
  scanId: string;
}

export default class FileUpload {
  #uppyIns: any;
  #accessKey: string;
  #stagingUrl: boolean;

  constructor(accessKey: string, stagingUrl = false) {
    this.#accessKey = accessKey;
    this.#stagingUrl = stagingUrl;
  }

  async uploadFileFrontend({ file, arrayMetaData, scanId }: UploadOptions) {
    if (!checkParameters(file, arrayMetaData, scanId)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if (!checkMetaDataValue(arrayMetaData)) {
      throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
    }
    arrayMetaData = addScanType(arrayMetaData, scanId);
    return new Promise((resolve, reject) => {
      if (this.#uppyIns) {
        this.#uppyIns.close();
      }
      this.#uppyIns = new Uppy.default({ autoProceed: true });
      this.#uppyIns.use(AwsS3Multipart.default, {
        limit: 10,
        retryDelays: [0, 1000, 3000, 5000],
        companionUrl: getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl }),
        getChunkSize: () => 5 * 1024 * 1024,
        createMultipartUpload: (file: any) => {
          const objectKey = `${scanId}.${file.extension}`;
          return fetchData({
            path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
            apiKey: this.#accessKey,
            stagingUrl: this.#stagingUrl,
            body: {
              objectKey,
              contentType: file.type,
              objectMetadata: arrayMetaData,
            },
          });
        },
        completeMultipartUpload: (file: any, { uploadId, key, parts }: { uploadId: string | number; key: string | number; parts: any }) =>
          fetchData({
            path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
            apiKey: this.#accessKey,
            stagingUrl: this.#stagingUrl,
            body: {
              uploadId,
              objectKey: key,
              parts,
              originalFileName: file.name,
            },
          }),

        signPart: (file: any, partData: any) =>
          fetchData({
            path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
            stagingUrl: this.#stagingUrl,
            apiKey: this.#accessKey,
            body: {
              objectKey: partData.key,
              uploadId: partData.uploadId,
              partNumber: partData.partNumber,
            },
          }),
      });

      this.#uppyIns.addFile({
        source: "manual",
        name: file.name,
        type: file.type,
        data: file,
      });

      this.#uppyIns.on("upload-error", (file: any, error: any, response: any) => {
        reject(error);
      });
      this.#uppyIns.on("upload-success", () => {
        resolve({ message: "file uploaded successfully" });
      });
      this.#uppyIns.on("complete", (result: any) => {
        if (this.#uppyIns) {
          this.#uppyIns.close();
        }
      });
    });
  }

  async uploadFile({ file, arrayMetaData, scanId }: UploadOptions) {
    if (!checkParameters(file, arrayMetaData, scanId)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if (!checkMetaDataValue(arrayMetaData)) {
      throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
    }

    return new Promise(async (resolve, reject) => {
      try {
        const res: { key: string; uploadId: string } = await fetchData({
          path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
          apiKey: this.#accessKey,
          stagingUrl: this.#stagingUrl,
          body: {
            objectKey: file.name,
            contentType: file.type,
            objectMetadata: arrayMetaData,
          },
          throwError: true,
        });
        const totalChunks = getFileChunks(file);
        const parts = [];
        for (let i = 0; i < totalChunks.length; i++) {
          const data: { url: string } = await fetchData({
            path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
            apiKey: this.#accessKey,
            stagingUrl: this.#stagingUrl,
            body: {
              objectKey: res?.key,
              uploadId: res?.uploadId,
              partNumber: i + 1,
            },
            throwError: true,
          });
          const val = await axios.put(data?.url, totalChunks[i], { headers: { "Content-Type": file.type, "X-Api-Key": this.#accessKey } });
          parts.push({ PartNumber: i + 1, ETag: val?.headers?.etag });
        }
        const completeValue = await fetchData({
          path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
          apiKey: this.#accessKey,
          stagingUrl: this.#stagingUrl,
          body: {
            uploadId: res?.uploadId,
            objectKey: res?.key,
            parts,
            originalFileName: file.name,
          },
          throwError: true,
        });
        resolve({ message: "successfully uploaded", data: completeValue });
      } catch (error: any) {
        reject(error);
      }
    });
  }
}
