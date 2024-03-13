const { UPPY_FILE_UPLOAD_ENDPOINT } = require("./constants");
const { fetchData } = require("./utils");
const Uppy = require("@uppy/aws-s3");
class Swan {
  constructor(key) {
    if (key !== 12345) {
      throw new Error({ message: "wrong access key" });
    }
    this.uppyIns = new Uppy({ autoProceed: true });
  }
  uploadFile({ file, objMetaData, scanId }) {
    this.uppyIns.use(AwsS3Multipart, {
      limit: 10,
      retryDelays: [0, 1000, 3000, 5000],
      getChunkSize: () => 5 * 1024 * 1024,
      createMultipartUpload: (file) => {
        const objectKey = `${scanId}.${file.extension}`;
        return fetchData({
          path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
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
          body: {
            objectKey: partData.key,
            uploadId: partData.uploadId,
            partNumber: partData.partNumber,
          },
        }),

      abortMultipartUpload: (file, { uploadId, key }) =>
        fetchData({
          path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
          body: {
            uploadId,
            objectKey: key,
            originalFileName: file.name,
          },
        }),
    });
    uppyIns.on("upload-error", () => {
      throw new Error({ message: "file uploading failed" });
    });
    uppyIns.on("upload-success", () => {
      return { message: "file uploaded successfully" };
    });
  }
}

module.exports = Swan;
