"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
const Uppy = require("fix-esm").require("@uppy/core");
const AwsS3Multipart = require("fix-esm").require("@uppy/aws-s3-multipart");
class FileUpload {
    #uppyIns;
    #accessKey;
    constructor(accessKey) {
        this.#accessKey = accessKey;
    }
    async uploadFile({ file, arrayMetaData, scanId }) {
        if (!(0, utils_js_1.checkParameters)(file, arrayMetaData, scanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.checkMetaDataValue)(arrayMetaData)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE_FOR_META_DATA);
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
                createMultipartUpload: (file) => {
                    const objectKey = `${scanId}.${file.extension}`;
                    return (0, utils_js_1.fetchData)({
                        path: constants_js_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                        apiKey: this.#accessKey,
                        body: {
                            objectKey,
                            contentType: file.type,
                            objectMetadata: arrayMetaData,
                        },
                    });
                },
                completeMultipartUpload: (file, { uploadId, key, parts }) => (0, utils_js_1.fetchData)({
                    path: constants_js_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                    apiKey: this.#accessKey,
                    body: {
                        uploadId,
                        objectKey: key,
                        parts,
                        originalFileName: file.name,
                    },
                }),
                signPart: (file, partData) => (0, utils_js_1.fetchData)({
                    path: constants_js_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                    apiKey: this.#accessKey,
                    body: {
                        objectKey: partData.key,
                        uploadId: partData.uploadId,
                        partNumber: partData.partNumber,
                    },
                }),
                // abortMultipartUpload: (file: any, { uploadId, key }: { uploadId: string | number; key: string | number }) =>
                //   fetchData({
                //     path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
                //     apiKey: this.#accessKey,
                //     body: {
                //       uploadId,
                //       objectKey: key,
                //       originalFileName: file.name,
                //     },
                //   }),
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
exports.default = FileUpload;
