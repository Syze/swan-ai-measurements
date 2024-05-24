import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, UPPY_FILE_UPLOAD_ENDPOINT } from "./constants.js";
import { checkMetaDataValue, checkParameters, fetchData } from "./utils.js";
const Uppy = require("fix-esm").require("@uppy/core");
const AwsS3Multipart = require("fix-esm").require("@uppy/aws-s3-multipart");
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

  constructor(accessKey: string) {
    this.#accessKey = accessKey;
  }

  async uploadFile({ file, arrayMetaData, scanId }: UploadOptions) {
    if (!checkParameters(file, arrayMetaData, scanId)) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if (!checkMetaDataValue(arrayMetaData)) {
      throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
    }

    return new Promise((resolve, reject) => {
      if (this.#uppyIns) {
        this.#uppyIns.close();
      }
      this.#uppyIns = new Uppy.default({ autoProceed: true });
      this.#uppyIns.use(AwsS3Multipart.default, {
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
        completeMultipartUpload: (file: any, { uploadId, key, parts }: any) =>
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

        abortMultipartUpload: (file: any, { uploadId, key }: any) =>
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
