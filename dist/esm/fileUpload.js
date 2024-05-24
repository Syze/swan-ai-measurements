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
var _FileUpload_uppyIns, _FileUpload_accessKey;
import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, UPPY_FILE_UPLOAD_ENDPOINT } from "./constants.js";
import { checkMetaDataValue, checkParameters, fetchData } from "./utils.js";
const Uppy = require("fix-esm").require("@uppy/core");
const AwsS3Multipart = require("fix-esm").require("@uppy/aws-s3-multipart");
class FileUpload {
    constructor(accessKey) {
        _FileUpload_uppyIns.set(this, void 0);
        _FileUpload_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _FileUpload_accessKey, accessKey, "f");
    }
    uploadFile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId }) {
            console.log(UPPY_FILE_UPLOAD_ENDPOINT);
            if (!checkParameters(file, arrayMetaData, scanId)) {
                throw new Error(REQUIRED_MESSAGE);
            }
            if (!checkMetaDataValue(arrayMetaData)) {
                throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
            }
            return new Promise((resolve, reject) => {
                if (__classPrivateFieldGet(this, _FileUpload_uppyIns, "f")) {
                    __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").close();
                }
                __classPrivateFieldSet(this, _FileUpload_uppyIns, new Uppy.default({ autoProceed: true }), "f");
                __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").use(AwsS3Multipart.default, {
                    limit: 10,
                    retryDelays: [0, 1000, 3000, 5000],
                    getChunkSize: () => 5 * 1024 * 1024,
                    createMultipartUpload: (file) => {
                        const objectKey = `${scanId}.${file.extension}`;
                        return fetchData({
                            path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                            apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                            body: {
                                objectKey,
                                contentType: file.type,
                                objectMetadata: arrayMetaData,
                            },
                        });
                    },
                    completeMultipartUpload: (file, { uploadId, key, parts }) => fetchData({
                        path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        body: {
                            uploadId,
                            objectKey: key,
                            parts,
                            originalFileName: file.name,
                        },
                    }),
                    signPart: (file, partData) => fetchData({
                        path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                        apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                        body: {
                            objectKey: partData.key,
                            uploadId: partData.uploadId,
                            partNumber: partData.partNumber,
                        },
                    }),
                    abortMultipartUpload: (file, { uploadId, key }) => fetchData({
                        path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
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
_FileUpload_uppyIns = new WeakMap(), _FileUpload_accessKey = new WeakMap();
export default FileUpload;
