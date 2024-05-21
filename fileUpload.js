const { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, UPPY_FILE_UPLOAD_ENDPOINT } = require("./constants.js");
const { checkMetaDataValue, checkParameters, fetchData } = require("./utils.js");
/**
 * Class representing a file uploader using Uppy for multipart uploads.
 */
class FileUpload {
  /**
   * The Uppy instance.
   * @type {Object}
   * @private
   */
  #uppyIns;

  /**
   * Reference to the Uppy module.
   * @type {Object}
   * @private
   */
  #Uppy;
  /**
   * Reference to the AwsS3Multipart module.
   * @type {Object}
   * @private
   */

  #AwsS3Multipart;
  /**
   * The access key used for authentication.
   * @type {string}
   * @private
   */
  #accessKey;
  /**
   * Constructs a new instance of the FileUpload class.
   * @param {string} accessKey - The access key used for authentication.
   */
  constructor(accessKey) {
    this.initializeModules();
    this.#accessKey = accessKey;
  }
  /**
   * Asynchronously initializes the Uppy and AwsS3Multipart modules.
   * @private
   */
  async initializeModules() {
    this.#Uppy = (await import("@uppy/core")).default;
    this.#AwsS3Multipart = (await import("@uppy/aws-s3-multipart")).default;
  }
  /**
   * Uploads a file with optional metadata and scan ID.
   * @param {Object} params - The parameters for file upload.
   * @param {File} params.file - The file to upload.
   * @param {Object} params.objMetaData - Optional. Metadata associated with the file.
   * @param {string} params.scanId - Optional. The ID of the scan.
   * @returns {Promise} - A promise that resolves when the file is uploaded successfully.
   * @throws {Error} - If required parameters are missing or metadata value is invalid.
   */
  async uploadFile({ file, objMetaData, scanId }) {
    if (checkParameters(file, objMetaData, scanId) === false) {
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
            apiKey: this.#accessKey,
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
            apiKey: this.#accessKey,
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
            apiKey: this.#accessKey,
            body: {
              objectKey: partData.key,
              uploadId: partData.uploadId,
              partNumber: partData.partNumber,
            },
          }),
        abortMultipartUpload: (file, { uploadId, key }) =>
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
