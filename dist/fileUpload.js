"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
import  Uppy from "@uppy/core";  
import AwsS3Multipart from "@uppy/aws-s3-multipart";
class FileUpload {
    #uppyIns;
    #accessKey;
    #stagingUrl;
    constructor(accessKey, stagingUrl = false) {
        this.#accessKey = accessKey;
        this.#stagingUrl = stagingUrl;
    }
    async uploadFileFrontend({ file, arrayMetaData, scanId }) {
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
            this.#uppyIns = new Uppy({ autoProceed: true });
            this.#uppyIns.use(AwsS3Multipart, {
                limit: 10,
                retryDelays: [0, 1000, 3000, 5000],
                companionUrl: (0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl }),
                getChunkSize: () => 5 * 1024 * 1024,
                createMultipartUpload: (file) => {
                    const objectKey = `${scanId}.${file.extension}`;
                    return (0, utils_js_1.fetchData)({
                        path: constants_js_1.FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                        apiKey: this.#accessKey,
                        stagingUrl: this.#stagingUrl,
                        body: {
                            objectKey,
                            contentType: file.type,
                            objectMetadata: arrayMetaData,
                        },
                    });
                },
                completeMultipartUpload: (file, { uploadId, key, parts }) => (0, utils_js_1.fetchData)({
                    path: constants_js_1.FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                    apiKey: this.#accessKey,
                    stagingUrl: this.#stagingUrl,
                    body: {
                        uploadId,
                        objectKey: key,
                        parts,
                        originalFileName: file.name,
                    },
                }),
                signPart: (file, partData) => (0, utils_js_1.fetchData)({
                    path: constants_js_1.FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
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
    async uploadFile({ file, arrayMetaData, scanId }) {
        if (!(0, utils_js_1.checkParameters)(file, arrayMetaData, scanId)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.checkMetaDataValue)(arrayMetaData)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE_FOR_META_DATA);
        }
        return new Promise(async (resolve, reject) => {
            try {
                const res = await (0, utils_js_1.fetchData)({
                    path: constants_js_1.FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                    apiKey: this.#accessKey,
                    stagingUrl: this.#stagingUrl,
                    body: {
                        objectKey: file.name,
                        contentType: file.type,
                        objectMetadata: arrayMetaData,
                    },
                    throwError: true,
                });
                const totalChunks = (0, utils_js_1.getFileChunks)(file);
                const parts = [];
                for (let i = 0; i < totalChunks.length; i++) {
                    const data = await (0, utils_js_1.fetchData)({
                        path: constants_js_1.FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                        apiKey: this.#accessKey,
                        stagingUrl: this.#stagingUrl,
                        body: {
                            objectKey: res?.key,
                            uploadId: res?.uploadId,
                            partNumber: i + 1,
                        },
                        throwError: true,
                    });
                    const val = await axios_1.default.put(data?.url, totalChunks[i], { headers: { "Content-Type": file.type, "X-Api-Key": this.#accessKey } });
                    parts.push({ PartNumber: i + 1, ETag: val?.headers?.etag });
                }
                const completeValue = await (0, utils_js_1.fetchData)({
                    path: constants_js_1.FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
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
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.default = FileUpload;
