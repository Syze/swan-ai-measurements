var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FileUpload_uppyIns, _FileUpload_accessKey, _FileUpload_stagingUrl;
import axios from "axios";
import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, FILE_UPLOAD_ENDPOINT, APP_AUTH_BASE_URL, REQUIRED_ERROR_MESSAGE_INVALID_EMAIL } from "./constants.js";
import { addScanType, checkMetaDataValue, checkParameters, fetchData, getFileChunks, getUrl } from "./utils.js";
import  Uppy from "@uppy/core";  
import AwsS3Multipart from "@uppy/aws-s3-multipart";
class FileUpload {
    constructor(accessKey, stagingUrl = false) {
        _FileUpload_uppyIns.set(this, void 0);
        _FileUpload_accessKey.set(this, void 0);
        _FileUpload_stagingUrl.set(this, void 0);
        __classPrivateFieldSet(this, _FileUpload_accessKey, accessKey, "f");
        __classPrivateFieldSet(this, _FileUpload_stagingUrl, stagingUrl, "f");
    }
    uploadFileFrontend(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId, email }) {
            if (!checkParameters(file, arrayMetaData, scanId)) {
                throw new Error(REQUIRED_MESSAGE);
            }
            if (!checkMetaDataValue(arrayMetaData)) {
                throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
            }
            if (!email.trim()) {
                throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
            }
            arrayMetaData = addScanType(arrayMetaData, scanId, email);
            return new Promise((resolve, reject) => {
                if (__classPrivateFieldGet(this, _FileUpload_uppyIns, "f")) {
                    __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").close();
                }
                __classPrivateFieldSet(this, _FileUpload_uppyIns, new Uppy({ autoProceed: true }), "f");
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").use(AwsS3Multipart, {
                    limit: 10,
                    retryDelays: [0, 1000, 3000, 5000],
                    companionUrl: getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: __classPrivateFieldGet(this, _FileUpload_stagingUrl, "f") }),
                    getChunkSize: () => 5 * 1024 * 1024,
                    createMultipartUpload: (file) => {
                        const objectKey = `${scanId}.${file.extension}`;
                        return fetchData({
                            path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                            apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                            stagingUrl: __classPrivateFieldGet(this, _FileUpload_stagingUrl, "f"),
                            body: {
                                objectKey,
                                contentType: file.type,
                                objectMetadata: arrayMetaData,
                            },
                        });
                    },
                    completeMultipartUpload: (file, { uploadId, key, parts }) => fetchData({
                        path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        stagingUrl: __classPrivateFieldGet(this, _FileUpload_stagingUrl, "f"),
                        body: {
                            uploadId,
                            objectKey: key,
                            parts,
                            originalFileName: file.name,
                        },
                    }),
                    signPart: (file, partData) => fetchData({
                        path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                        stagingUrl: __classPrivateFieldGet(this, _FileUpload_stagingUrl, "f"),
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        body: {
                            objectKey: partData.key,
                            uploadId: partData.uploadId,
                            partNumber: partData.partNumber,
                        },
                    }),
                });
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").addFile({
                    source: "manual",
                    name: file.name,
                    type: file.type,
                    data: file,
                });
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").on("upload-error", (file, error, response) => {
                    reject(error);
                });
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").on("upload-success", () => {
                    resolve({ message: "file uploaded successfully" });
                });
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").on("complete", (result) => {
                    if (__classPrivateFieldGet(this, _FileUpload_uppyIns, "f")) {
                        __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").close();
                    }
                });
            });
        });
    }
    uploadFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId, email }) {
            if (!checkParameters(file, arrayMetaData, scanId)) {
                throw new Error(REQUIRED_MESSAGE);
            }
            if (!checkMetaDataValue(arrayMetaData)) {
                throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
            }
            if (!email.trim()) {
                throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
            }
            arrayMetaData = addScanType(arrayMetaData, scanId, email);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                try {
                    const res = yield fetchData({
                        path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        stagingUrl: __classPrivateFieldGet(this, _FileUpload_stagingUrl, "f"),
                        body: {
                            objectKey: file.name,
                            contentType: file.type,
                            objectMetadata: arrayMetaData,
                        },
                        throwError: true,
                    });
                    const totalChunks = getFileChunks(file);
                    const parts = [];
                    for (let i = 0; i < totalChunks.length; i++) {
                        const data = yield fetchData({
                            path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                            apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                            stagingUrl: __classPrivateFieldGet(this, _FileUpload_stagingUrl, "f"),
                            body: {
                                objectKey: res === null || res === void 0 ? void 0 : res.key,
                                uploadId: res === null || res === void 0 ? void 0 : res.uploadId,
                                partNumber: i + 1,
                            },
                            throwError: true,
                        });
                        const val = yield axios.put(data === null || data === void 0 ? void 0 : data.url, totalChunks[i], { headers: { "Content-Type": file.type, "X-Api-Key": __classPrivateFieldGet(this, _FileUpload_accessKey, "f") } });
                        parts.push({ PartNumber: i + 1, ETag: (_b = val === null || val === void 0 ? void 0 : val.headers) === null || _b === void 0 ? void 0 : _b.etag });
                    }
                    const completeValue = yield fetchData({
                        path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        stagingUrl: __classPrivateFieldGet(this, _FileUpload_stagingUrl, "f"),
                        body: {
                            uploadId: res === null || res === void 0 ? void 0 : res.uploadId,
                            objectKey: res === null || res === void 0 ? void 0 : res.key,
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
            }));
        });
    }
}
_FileUpload_uppyIns = new WeakMap(), _FileUpload_accessKey = new WeakMap(), _FileUpload_stagingUrl = new WeakMap();
export default FileUpload;
