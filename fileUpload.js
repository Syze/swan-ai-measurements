import AwsS3Multipart from "@uppy/aws-s3-multipart";
import Uppy from "@uppy/core";
import { FILE_UPLOAD_KEY, UPPY_FILE_UPLOAD_ENDPOINT } from "./constants.js";

function uploadFile({ file, objMetaData, scanId, accessKey }) {
  return new Promise((resolve, reject) => {
    uppyIns = new Uppy({ autoProceed: true });
    uppyIns.use(AwsS3Multipart, {
      limit: 10,
      retryDelays: [0, 1000, 3000, 5000],
      getChunkSize: () => 5 * 1024 * 1024,
      createMultipartUpload: (file) => {
        const objectKey = `${scanId}.${file.extension}`;
        return fetchData({
          path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
          apiKey: FILE_UPLOAD_KEY,
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
          apiKey: FILE_UPLOAD_KEY,
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
          apiKey: FILE_UPLOAD_KEY,
          body: {
            objectKey: partData.key,
            uploadId: partData.uploadId,
            partNumber: partData.partNumber,
          },
        }),

      abortMultipartUpload: (file, { uploadId, key }) =>
        fetchData({
          path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
          apiKey: FILE_UPLOAD_KEY,
          body: {
            uploadId,
            objectKey: key,
            originalFileName: file.name,
          },
        }),
    });

    uppyIns.addFile({
      source: "manual",
      name: file.name,
      type: file.type,
      data: file,
    });

    uppyIns.on("upload-error", (file, error, response) => {
      reject(error);
    });
    uppyIns.on("upload-success", () => {
      resolve({ message: "file uploaded successfully" });
    });
    uppyIns.on("complete", (result) => {
      if (uppyIns) {
        uppyIns.close();
      }
    });
  });
}

export default uploadFile;
