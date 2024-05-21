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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var _FileUpload_uppyIns, _FileUpload_Uppy, _FileUpload_AwsS3Multipart, _FileUpload_accessKey;
var _a = require("./constants.js"), REQUIRED_MESSAGE = _a.REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA = _a.REQUIRED_MESSAGE_FOR_META_DATA, UPPY_FILE_UPLOAD_ENDPOINT = _a.UPPY_FILE_UPLOAD_ENDPOINT;
var _b = require("./utils.js"), checkMetaDataValue = _b.checkMetaDataValue, checkParameters = _b.checkParameters, fetchData = _b.fetchData;
/**
 * Class representing a file uploader using Uppy for multipart uploads.
 */
var FileUpload = /** @class */ (function () {
    /**
     * Constructs a new instance of the FileUpload class.
     * @param {string} accessKey - The access key used for authentication.
     */
    function FileUpload(accessKey) {
        /**
         * The Uppy instance.
         * @type {Object}
         * @private
         */
        _FileUpload_uppyIns.set(this, void 0);
        /**
         * Reference to the Uppy module.
         * @type {Object}
         * @private
         */
        _FileUpload_Uppy.set(this, void 0);
        /**
         * Reference to the AwsS3Multipart module.
         * @type {Object}
         * @private
         */
        _FileUpload_AwsS3Multipart.set(this, void 0);
        /**
         * The access key used for authentication.
         * @type {string}
         * @private
         */
        _FileUpload_accessKey.set(this, void 0);
        this.initializeModules();
        __classPrivateFieldSet(this, _FileUpload_accessKey, accessKey, "f");
    }
    /**
     * Asynchronously initializes the Uppy and AwsS3Multipart modules.
     * @private
     */
    FileUpload.prototype.initializeModules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [this, _FileUpload_Uppy];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("@uppy/core")); })];
                    case 1:
                        __classPrivateFieldSet.apply(void 0, _a.concat([(_c.sent()).default, "f"]));
                        _b = [this, _FileUpload_AwsS3Multipart];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("@uppy/aws-s3-multipart")); })];
                    case 2:
                        __classPrivateFieldSet.apply(void 0, _b.concat([(_c.sent()).default, "f"]));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Uploads a file with optional metadata and scan ID.
     * @param {Object} params - The parameters for file upload.
     * @param {File} params.file - The file to upload.
     * @param {Object} params.objMetaData - Optional. Metadata associated with the file.
     * @param {string} params.scanId - Optional. The ID of the scan.
     * @returns {Promise} - A promise that resolves when the file is uploaded successfully.
     * @throws {Error} - If required parameters are missing or metadata value is invalid.
     */
    FileUpload.prototype.uploadFile = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var _this = this;
            var file = _b.file, objMetaData = _b.objMetaData, scanId = _b.scanId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (checkParameters(file, objMetaData, scanId) === false) {
                            throw new Error(REQUIRED_MESSAGE);
                        }
                        if (checkMetaDataValue(objMetaData) === false) {
                            throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
                        }
                        if (!(!__classPrivateFieldGet(this, _FileUpload_Uppy, "f") || !__classPrivateFieldGet(this, _FileUpload_AwsS3Multipart, "f"))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initializeModules()];
                    case 1:
                        _c.sent();
                        _c.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            if (__classPrivateFieldGet(_this, _FileUpload_uppyIns, "f")) {
                                __classPrivateFieldGet(_this, _FileUpload_uppyIns, "f").close();
                            }
                            __classPrivateFieldSet(_this, _FileUpload_uppyIns, new (__classPrivateFieldGet(_this, _FileUpload_Uppy, "f"))({ autoProceed: true }), "f");
                            __classPrivateFieldGet(_this, _FileUpload_uppyIns, "f").use(__classPrivateFieldGet(_this, _FileUpload_AwsS3Multipart, "f"), {
                                limit: 10,
                                retryDelays: [0, 1000, 3000, 5000],
                                getChunkSize: function () { return 5 * 1024 * 1024; },
                                createMultipartUpload: function (file) {
                                    var objectKey = "".concat(scanId, ".").concat(file.extension);
                                    return fetchData({
                                        path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_START,
                                        apiKey: __classPrivateFieldGet(_this, _FileUpload_accessKey, "f"),
                                        body: {
                                            objectKey: objectKey,
                                            contentType: file.type,
                                            objectMetadata: objMetaData,
                                        },
                                    });
                                },
                                completeMultipartUpload: function (file, _a) {
                                    var uploadId = _a.uploadId, key = _a.key, parts = _a.parts;
                                    return fetchData({
                                        path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
                                        apiKey: __classPrivateFieldGet(_this, _FileUpload_accessKey, "f"),
                                        body: {
                                            uploadId: uploadId,
                                            objectKey: key,
                                            parts: parts,
                                            originalFileName: file.name,
                                        },
                                    });
                                },
                                signPart: function (file, partData) {
                                    return fetchData({
                                        path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                                        apiKey: __classPrivateFieldGet(_this, _FileUpload_accessKey, "f"),
                                        body: {
                                            objectKey: partData.key,
                                            uploadId: partData.uploadId,
                                            partNumber: partData.partNumber,
                                        },
                                    });
                                },
                                abortMultipartUpload: function (file, _a) {
                                    var uploadId = _a.uploadId, key = _a.key;
                                    return fetchData({
                                        path: UPPY_FILE_UPLOAD_ENDPOINT.UPLOAD_ABORT,
                                        apiKey: __classPrivateFieldGet(_this, _FileUpload_accessKey, "f"),
                                        body: {
                                            uploadId: uploadId,
                                            objectKey: key,
                                            originalFileName: file.name,
                                        },
                                    });
                                },
                            });
                            __classPrivateFieldGet(_this, _FileUpload_uppyIns, "f").addFile({
                                source: "manual",
                                name: file.name,
                                type: file.type,
                                data: file,
                            });
                            __classPrivateFieldGet(_this, _FileUpload_uppyIns, "f").on("upload-error", function (file, error, response) {
                                reject(error);
                            });
                            __classPrivateFieldGet(_this, _FileUpload_uppyIns, "f").on("upload-success", function () {
                                resolve({ message: "file uploaded successfully" });
                            });
                            __classPrivateFieldGet(_this, _FileUpload_uppyIns, "f").on("complete", function (result) {
                                if (__classPrivateFieldGet(_this, _FileUpload_uppyIns, "f")) {
                                    __classPrivateFieldGet(_this, _FileUpload_uppyIns, "f").close();
                                }
                            });
                        })];
                }
            });
        });
    };
    return FileUpload;
}());
_FileUpload_uppyIns = new WeakMap(), _FileUpload_Uppy = new WeakMap(), _FileUpload_AwsS3Multipart = new WeakMap(), _FileUpload_accessKey = new WeakMap();
module.exports = FileUpload;
