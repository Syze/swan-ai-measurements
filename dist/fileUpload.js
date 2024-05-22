"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _FileUpload_instances, _FileUpload_uppyIns, _FileUpload_accessKey, _FileUpload_Uppy, _FileUpload_AwsS3Multipart, _FileUpload_initializeModules;
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class FileUpload {
    constructor(accessKey) {
        _FileUpload_instances.add(this);
        _FileUpload_uppyIns.set(this, void 0);
        _FileUpload_accessKey.set(this, void 0);
        _FileUpload_Uppy.set(this, void 0);
        _FileUpload_AwsS3Multipart.set(this, void 0);
        __classPrivateFieldGet(this, _FileUpload_instances, "m", _FileUpload_initializeModules).call(this);
        __classPrivateFieldSet(this, _FileUpload_accessKey, accessKey, "f");
    }
    uploadFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId }) {
            if ((0, utils_1.checkParameters)(file, arrayMetaData, scanId) === false) {
                throw new Error(constants_1.REQUIRED_MESSAGE);
            }
            if ((0, utils_1.checkMetaDataValue)(arrayMetaData) === false) {
                throw new Error(constants_1.REQUIRED_MESSAGE_FOR_META_DATA);
            }
            if (!__classPrivateFieldGet(this, _FileUpload_Uppy, "f") || !__classPrivateFieldGet(this, _FileUpload_AwsS3Multipart, "f")) {
                yield __classPrivateFieldGet(this, _FileUpload_instances, "m", _FileUpload_initializeModules).call(this);
            }
            return new Promise((resolve, reject) => {
                if (__classPrivateFieldGet(this, _FileUpload_uppyIns, "f")) {
                    __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").close();
                }
                __classPrivateFieldSet(this, _FileUpload_uppyIns, new (__classPrivateFieldGet(this, _FileUpload_Uppy, "f"))({ autoProceed: true }), "f");
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").use(__classPrivateFieldGet(this, _FileUpload_AwsS3Multipart, "f"), {
                    limit: 10,
                    retryDelays: [0, 1000, 3000, 5000],
                    getChunkSize: () => 5 * 1024 * 1024,
                    createMultipartUpload: (file) => {
                        const objectKey = `${scanId}.${file.extension}`;
                        return (0, utils_1.fetchData)({
                            path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                            apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                            body: {
                                objectKey,
                                contentType: file.type,
                                objectMetadata: arrayMetaData,
                            },
                        });
                    },
                    completeMultipartUpload: (file, { uploadId, key, parts }) => (0, utils_1.fetchData)({
                        path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        body: {
                            uploadId,
                            objectKey: key,
                            parts,
                            originalFileName: file.name,
                        },
                    }),
                    signPart: (file, partData) => (0, utils_1.fetchData)({
                        path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        body: {
                            objectKey: partData.key,
                            uploadId: partData.uploadId,
                            partNumber: partData.partNumber,
                        },
                    }),
                    abortMultipartUpload: (file, { uploadId, key }) => (0, utils_1.fetchData)({
                        path: constants_1.UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        body: {
                            uploadId,
                            objectKey: key,
                            originalFileName: file.name,
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
}
_FileUpload_uppyIns = new WeakMap(), _FileUpload_accessKey = new WeakMap(), _FileUpload_Uppy = new WeakMap(), _FileUpload_AwsS3Multipart = new WeakMap(), _FileUpload_instances = new WeakSet(), _FileUpload_initializeModules = function _FileUpload_initializeModules() {
    return __awaiter(this, void 0, void 0, function* () {
        __classPrivateFieldSet(this, _FileUpload_Uppy, (yield Promise.resolve().then(() => require("@uppy/core"))).default, "f");
        __classPrivateFieldSet(this, _FileUpload_AwsS3Multipart, (yield Promise.resolve().then(() => require("@uppy/aws-s3-multipart"))).default, "f");
    });
};
exports.default = FileUpload;
