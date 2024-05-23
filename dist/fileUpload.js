"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class FileUpload {
    #uppyIns;
    #accessKey;
    #Uppy;
    #AwsS3Multipart;
    constructor(accessKey) {
        this.#accessKey = accessKey;
        this.#initializeModules();
    }
    async #initializeModules() {
        if (!this.#Uppy || !this.#AwsS3Multipart) {
            // const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            const Uppy = () => Promise.resolve().then(() => __importStar(require("@uppy/core"))).then(({ default: Uppy }) => Uppy);
            const AwsS3Multipart = () => Promise.resolve().then(() => __importStar(require("@uppy/aws-s3-multipart"))).then(({ default: AwsS3Multipart }) => AwsS3Multipart);
            // const { default: Uppy } = await import("@uppy/core");
            // const { default: AwsS3Multipart } = await import("@uppy/aws-s3-multipart");
            this.#Uppy = Uppy;
            this.#AwsS3Multipart = AwsS3Multipart;
        }
    }
    async uploadFile({ file, arrayMetaData, scanId }) {
        if (!(0, utils_1.checkParameters)(file, arrayMetaData, scanId)) {
            throw new Error(constants_1.REQUIRED_MESSAGE);
        }
        if (!(0, utils_1.checkMetaDataValue)(arrayMetaData)) {
            throw new Error(constants_1.REQUIRED_MESSAGE_FOR_META_DATA);
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
                    return (0, utils_1.fetchData)({
                        path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                        apiKey: this.#accessKey,
                        body: {
                            objectKey,
                            contentType: file.type,
                            objectMetadata: arrayMetaData,
                        },
                    });
                },
                completeMultipartUpload: (file, { uploadId, key, parts }) => (0, utils_1.fetchData)({
                    path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                    apiKey: this.#accessKey,
                    body: {
                        uploadId,
                        objectKey: key,
                        parts,
                        originalFileName: file.name,
                    },
                }),
                signPart: (file, partData) => (0, utils_1.fetchData)({
                    path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                    apiKey: this.#accessKey,
                    body: {
                        objectKey: partData.key,
                        uploadId: partData.uploadId,
                        partNumber: partData.partNumber,
                    },
                }),
                abortMultipartUpload: (file, { uploadId, key }) => (0, utils_1.fetchData)({
                    path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
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
exports.default = FileUpload;
