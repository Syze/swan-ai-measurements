"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
const core_1 = __importDefault(require("@uppy/core"));
const aws_s3_multipart_1 = __importDefault(require("@uppy/aws-s3-multipart"));
class FileUpload {
    #uppyIns;
    #accessKey;
    #stagingUrl;
    constructor(accessKey, stagingUrl = false) {
        this.#accessKey = accessKey;
        this.#stagingUrl = stagingUrl;
    }
    async uploadFileFrontend({ file, arrayMetaData, scanId, email, callBack }) {
        if (!(0, utils_js_1.checkParameters)(file, arrayMetaData, scanId, email)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(email.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        if (!(0, utils_js_1.checkMetaDataValue)(arrayMetaData)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE_FOR_META_DATA);
        }
        arrayMetaData = (0, utils_js_1.addScanType)(arrayMetaData, scanId, email);
        return new Promise((resolve, reject) => {
            if (this.#uppyIns) {
                this.#uppyIns.close();
            }
            this.#uppyIns = new core_1.default({ autoProceed: true });
            this.#uppyIns.use(aws_s3_multipart_1.default, {
                limit: 10,
                retryDelays: [0, 1000, 3000, 5000],
                companionUrl: (0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl }),
                getChunkSize: () => constants_js_1.CHUNK_SIZE,
                createMultipartUpload: (file) => {
                    const totalChunks = Math.ceil(file.size / constants_js_1.CHUNK_SIZE);
                    callBack?.({ eventName: "uploading_start", message: `File ${file.name} will be divided into ${totalChunks} chunks` });
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
                completeMultipartUpload: (file, { uploadId, key, parts }) => {
                    callBack?.({ eventName: "uploading_complete_start", message: `${parts.length} chunks of file, uploaded` });
                    return (0, utils_js_1.fetchData)({
                        path: constants_js_1.FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                        apiKey: this.#accessKey,
                        stagingUrl: this.#stagingUrl,
                        body: {
                            uploadId,
                            objectKey: key,
                            parts,
                            originalFileName: file.name,
                        },
                    }).then((response) => {
                        callBack?.({ eventName: "uploading_complete_end", message: `Multipart upload completed successfully` });
                        return response;
                    });
                },
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
                if (error.isNetworkError) {
                    this.#uppyIns.retryUpload(file.id);
                }
                else {
                    reject(error);
                }
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
    async uploadFile({ file, arrayMetaData, scanId, email }) {
        if (!(0, utils_js_1.checkParameters)(file, arrayMetaData, scanId, email)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_js_1.isValidEmail)(email.trim())) {
            throw new Error(constants_js_1.REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
        }
        if (!(0, utils_js_1.checkMetaDataValue)(arrayMetaData)) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE_FOR_META_DATA);
        }
        arrayMetaData = (0, utils_js_1.addScanType)(arrayMetaData, scanId, email);
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
    async setDeviceInfo(data) {
        const { scanId, ...rest } = data;
        if ((0, utils_js_1.checkParameters)(scanId) === false) {
            throw new Error(constants_js_1.REQUIRED_MESSAGE);
        }
        return axios_1.default.post(`${(0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${constants_js_1.API_ENDPOINTS.DEVICE_INFO}/${scanId}`, { device_info: { ...rest } }, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
}
exports.default = FileUpload;
