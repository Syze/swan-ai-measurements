const { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, UPPY_FILE_UPLOAD_ENDPOINT } = require("./constants.js");
const { checkMetaDataValue, checkParameters, fetchData } = require("./utils.js");

class FileUpload {
  #uppyIns;
  #Uppy;
  #AwsS3Multipart;

  constructor() {
    this.initializeModules();
  }

  async initializeModules() {
    this.#Uppy = (await import("@uppy/core")).default;
    this.#AwsS3Multipart = (await import("@uppy/aws-s3-multipart")).default;
  }

  async uploadFile({ file, objMetaData, scanId, accessKey }) {
    if (checkParameters(file, objMetaData, scanId, accessKey) === false) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if (checkMetaDataValue(objMetaData) === false) {
      throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
    }

    if (!this.#Uppy || !this.#AwsS3Multipart) {
      await this.initializeModules();
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
        createMultipartUpload: (file) => {
          const objectKey = `${scanId}.${file.extension}`;
          return fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
            apiKey: accessKey,
            body: {
              objectKey,
              contentType: file.type,
              objectMetadata: objMetaData,
            },
          });
        },
        completeMultipartUpload: (file, { uploadId, key, parts }) =>
          fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
            apiKey: accessKey,
            body: {
              uploadId,
              objectKey: key,
              parts,
              originalFileName: file.name,
            },
          }),
        signPart: (file, partData) =>
          fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
            apiKey: accessKey,
            body: {
              objectKey: partData.key,
              uploadId: partData.uploadId,
              partNumber: partData.partNumber,
            },
          }),
        abortMultipartUpload: (file, { uploadId, key }) =>
          fetchData({
            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
            apiKey: accessKey,
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

      this.#uppyIns.on("upload-error", (file, error, response) => {
        reject(error);
      });
      this.#uppyIns.on("upload-success", () => {
        resolve({ message: "file uploaded successfully" });
      });
      this.#uppyIns.on("complete", (result) => {
        if (this.#uppyIns) {
          this.#uppyIns.close();
        }
      });
    });
  }
}

module.exports = FileUpload;
