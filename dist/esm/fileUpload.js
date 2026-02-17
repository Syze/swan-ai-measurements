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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _FileUpload_instances, _FileUpload_uppyIns, _FileUpload_accessKey, _FileUpload_urlType, _FileUpload_token, _FileUpload_getHeaders, _FileUpload_uppyFileUploader;
import axios from "axios";
import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, FILE_UPLOAD_ENDPOINT, APP_AUTH_BASE_URL, REQUIRED_ERROR_MESSAGE_INVALID_EMAIL, API_ENDPOINTS, CHUNK_SIZE, requiredFaceScanMetaData } from "./constants.js";
import { addScanType, checkMetaDataValue, checkParameters, checkValues, fetchData, getFileChunks, getUrl, isValidEmail } from "./utils.js";
import Uppy from "@uppy/core";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import { URLType } from "./enum.js";
class FileUpload {
    constructor(accessKey, urlType = URLType.PROD, token) {
        _FileUpload_instances.add(this);
        _FileUpload_uppyIns.set(this, void 0);
        _FileUpload_accessKey.set(this, void 0);
        _FileUpload_urlType.set(this, void 0);
        _FileUpload_token.set(this, void 0);
        __classPrivateFieldSet(this, _FileUpload_accessKey, accessKey, "f");
        __classPrivateFieldSet(this, _FileUpload_urlType, urlType, "f");
        __classPrivateFieldSet(this, _FileUpload_token, token, "f");
    }
    uploadFileFrontend(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId, email, callBack }) {
            if (!checkParameters(file, arrayMetaData, scanId, email)) {
                throw new Error(REQUIRED_MESSAGE);
            }
            if (!isValidEmail(email.trim())) {
                throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
            }
            if (!checkMetaDataValue(arrayMetaData)) {
                throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
            }
            arrayMetaData = addScanType(arrayMetaData, scanId, email);
            return __classPrivateFieldGet(this, _FileUpload_instances, "m", _FileUpload_uppyFileUploader).call(this, { callBack, arrayMetaData, scanId, email, file });
        });
    }
    faceScanFileUploader(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, objectKey, email, callBack }) {
            if (!checkParameters(file, arrayMetaData, objectKey, email)) {
                throw new Error(REQUIRED_MESSAGE);
            }
            if (!isValidEmail(email.trim())) {
                throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
            }
            if (!checkValues(arrayMetaData, requiredFaceScanMetaData)) {
                throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
            }
            arrayMetaData.push({ email });
            return __classPrivateFieldGet(this, _FileUpload_instances, "m", _FileUpload_uppyFileUploader).call(this, { callBack, arrayMetaData, objectKey, email, file });
        });
    }
    uploadFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId, email }) {
            if (!checkParameters(file, arrayMetaData, scanId, email)) {
                throw new Error(REQUIRED_MESSAGE);
            }
            if (!isValidEmail(email.trim())) {
                throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
            }
            if (!checkMetaDataValue(arrayMetaData)) {
                throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
            }
            arrayMetaData = addScanType(arrayMetaData, scanId, email);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                try {
                    const res = yield fetchData({
                        path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        token: __classPrivateFieldGet(this, _FileUpload_token, "f"),
                        urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f"),
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
                            token: __classPrivateFieldGet(this, _FileUpload_token, "f"),
                            urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f"),
                            body: {
                                objectKey: res === null || res === void 0 ? void 0 : res.key,
                                uploadId: res === null || res === void 0 ? void 0 : res.uploadId,
                                partNumber: i + 1,
                            },
                            throwError: true,
                        });
                        const val = yield axios.put(data === null || data === void 0 ? void 0 : data.url, totalChunks[i], { headers: __classPrivateFieldGet(this, _FileUpload_instances, "m", _FileUpload_getHeaders).call(this, { "Content-Type": file.type }) });
                        parts.push({ PartNumber: i + 1, ETag: (_b = val === null || val === void 0 ? void 0 : val.headers) === null || _b === void 0 ? void 0 : _b.etag });
                    }
                    const completeValue = yield fetchData({
                        path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        token: __classPrivateFieldGet(this, _FileUpload_token, "f"),
                        urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f"),
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
    setDeviceInfo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { scanId } = data, rest = __rest(data, ["scanId"]);
            if (checkParameters(scanId) === false) {
                throw new Error(REQUIRED_MESSAGE);
            }
            return axios.post(`${getUrl({ urlName: APP_AUTH_BASE_URL, urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f") })}${API_ENDPOINTS.DEVICE_INFO}/${scanId}`, { device_info: Object.assign({}, rest) }, {
                headers: __classPrivateFieldGet(this, _FileUpload_instances, "m", _FileUpload_getHeaders).call(this),
            });
        });
    }
}
_FileUpload_uppyIns = new WeakMap(), _FileUpload_accessKey = new WeakMap(), _FileUpload_urlType = new WeakMap(), _FileUpload_token = new WeakMap(), _FileUpload_instances = new WeakSet(), _FileUpload_getHeaders = function _FileUpload_getHeaders(extraHeaders = {}) {
    return Object.assign(Object.assign(Object.assign({}, extraHeaders), (__classPrivateFieldGet(this, _FileUpload_accessKey, "f") ? { "X-Api-Key": __classPrivateFieldGet(this, _FileUpload_accessKey, "f") } : {})), (__classPrivateFieldGet(this, _FileUpload_token, "f") ? { Authorization: `Bearer ${__classPrivateFieldGet(this, _FileUpload_token, "f")}` } : {}));
}, _FileUpload_uppyFileUploader = function _FileUpload_uppyFileUploader({ callBack, arrayMetaData, scanId, email, file, objectKey }) {
    return new Promise((resolve, reject) => {
        if (__classPrivateFieldGet(this, _FileUpload_uppyIns, "f")) {
            __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").close();
        }
        __classPrivateFieldSet(this, _FileUpload_uppyIns, new Uppy({ autoProceed: true }), "f");
        __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").use(AwsS3Multipart, {
            limit: 10,
            retryDelays: [0, 1000, 3000, 5000],
            companionUrl: getUrl({ urlName: APP_AUTH_BASE_URL, urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f") }),
            getChunkSize: () => CHUNK_SIZE,
            createMultipartUpload: (file) => {
                const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                callBack === null || callBack === void 0 ? void 0 : callBack({ eventName: "uploading_start", message: `File ${file.name} will be divided into ${totalChunks} chunks`, scanId, email, objectKey });
                const ObjectKey = `${scanId || objectKey}.${file.extension}`;
                return fetchData({
                    path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                    apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                    token: __classPrivateFieldGet(this, _FileUpload_token, "f"),
                    urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f"),
                    body: {
                        objectKey: ObjectKey,
                        contentType: file.type,
                        objectMetadata: arrayMetaData,
                    },
                });
            },
            completeMultipartUpload: (file, { uploadId, key, parts }) => {
                callBack === null || callBack === void 0 ? void 0 : callBack({ eventName: "uploading_complete_start", message: `${parts.length} chunks of file, uploaded`, scanId, email, objectKey });
                return fetchData({
                    path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                    apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                    token: __classPrivateFieldGet(this, _FileUpload_token, "f"),
                    urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f"),
                    body: {
                        uploadId,
                        objectKey: key,
                        parts,
                        originalFileName: file.name,
                    },
                }).then((response) => {
                    callBack === null || callBack === void 0 ? void 0 : callBack({ eventName: "uploading_complete_end", message: `Multipart upload completed successfully`, scanId, email, objectKey });
                    return response;
                });
            },
            signPart: (file, partData) => fetchData({
                path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                urlType: __classPrivateFieldGet(this, _FileUpload_urlType, "f"),
                apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                token: __classPrivateFieldGet(this, _FileUpload_token, "f"),
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
            if (error.isNetworkError) {
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").retryUpload(file.id);
            }
            else {
                reject(error);
            }
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
};
export default FileUpload;
