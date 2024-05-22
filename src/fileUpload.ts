import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, UPPY_FILE_UPLOAD_ENDPOINT } from "./constants";
import { checkMetaDataValue, checkParameters, fetchData } from "./utils";

interface ObjMetaData {
  gender: string;
  scan_id: string;
  email: string;
  focal_length: string;
  height: string;
  customer_store_url: string;
  clothes_fit: string;
  scan_type: string;
  callback_url: string;
}

interface UploadOptions {
  file: any;
  arrayMetaData: ObjMetaData[];
  scanId: string;
}

export default class FileUpload {
  #uppyIns: any;
  #accessKey: string;
  #Uppy: any;
  #AwsS3Multipart: any;
  constructor(accessKey: string) {
    this.#initializeModules();
    this.#accessKey = accessKey;
  }
  async #initializeModules() {
    this.#Uppy = (await import("@uppy/core")).default;
    this.#AwsS3Multipart = (await import("@uppy/aws-s3-multipart")).default;
  }
  async uploadFile({ file, arrayMetaData, scanId }: UploadOptions) {
    if (checkParameters(file, arrayMetaData, scanId) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if (checkMetaDataValue(arrayMetaData) === false) {
      throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
    }

    if (!this.#Uppy || !this.#AwsS3Multipart) {
      await this.#initializeModules();
    }
    return new Promise((resolve, reject) => {
      if (this.#uppyIns) {
        this.#uppyIns.close();
      }
      this.#uppyIns = new this.#Uppy({ autoProceed: true });
      this.#uppyIns.use(this.#AwsS3Multipart, {
        limit: 10,
        retryDelays: [0, 1000, 3000, 5000],
        getChunkSize: () => 5 * 1024 * 1024,
        createMultipartUpload: (file: any) => {
          const objectKey = `${scanId}.${file.extension}`;
          return fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
            apiKey: this.#accessKey,
            body: {
              objectKey,
              contentType: file.type,
              objectMetadata: arrayMetaData,
            },
          });
        },
        completeMultipartUpload: (file: any, { uploadId, key, parts }: { uploadId: string | number; key: string | number; parts: any }) =>
          fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
            apiKey: this.#accessKey,
            body: {
              uploadId,
              objectKey: key,
              parts,
              originalFileName: file.name,
            },
          }),

        signPart: (file: any, partData: any) =>
          fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
            apiKey: this.#accessKey,
            body: {
              objectKey: partData.key,
              uploadId: partData.uploadId,
              partNumber: partData.partNumber,
            },
          }),

        abortMultipartUpload: (file: any, { uploadId, key }: { uploadId: string | number; key: string | number }) =>
          fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
            apiKey: this.#accessKey,
            body: {
              uploadId,
              objectKey: key,
              originalFileName: file.name,
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
}
