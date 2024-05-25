var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value), value;
  };
var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
var _FileUpload_uppyIns, _FileUpload_accessKey;
import axios from "axios";
import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, FILE_UPLOAD_ENDPOINT } from "./constants.js";
import { checkMetaDataValue, checkParameters, fetchData, getFileChunks } from "./utils.js";
import Uppy from "@uppy/core";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
class FileUpload {
  constructor(accessKey) {
    _FileUpload_uppyIns.set(this, void 0);
    _FileUpload_accessKey.set(this, void 0);
    __classPrivateFieldSet(this, _FileUpload_accessKey, accessKey, "f");
  }
  uploadFileFrontend(_a) {
    return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId }) {
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
        __classPrivateFieldSet(this, _FileUpload_uppyIns, new Uppy({ autoProceed: true }), "f");
        __classPrivateFieldGet(this, _FileUpload_uppyIns, "f").use(AwsS3Multipart, {
          limit: 10,
          retryDelays: [0, 1000, 3000, 5000],
          getChunkSize: () => 5 * 1024 * 1024,
          createMultipartUpload: (file) => {
            const objectKey = `${scanId}.${file.extension}`;
            return fetchData({
              path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
              apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
              body: {
                objectKey,
                contentType: file.type,
                objectMetadata: arrayMetaData,
              },
            });
          },
          completeMultipartUpload: (file, { uploadId, key, parts }) =>
            fetchData({
              path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
              apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
              body: {
                uploadId,
                objectKey: key,
                parts,
                originalFileName: file.name,
              },
            }),
          signPart: (file, partData) =>
            fetchData({
              path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
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
  uploadFileBackend(_a) {
    return __awaiter(this, arguments, void 0, function* ({ file, arrayMetaData, scanId }) {
      if (!checkParameters(file, arrayMetaData, scanId)) {
        throw new Error(REQUIRED_MESSAGE);
      }
      if (!checkMetaDataValue(arrayMetaData)) {
        throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
      }
      return new Promise((resolve, reject) =>
        __awaiter(this, void 0, void 0, function* () {
          try {
            const res = yield fetchData({
              path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
              apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
              body: {
                objectKey: file.name,
                contentType: file.type,
                objectMetadata: arrayMetaData,
              },
              throwError: true,
            });
            console.log(res, "res for start");
            const totalChunks = getFileChunks(file);
            console.log(totalChunks, "total chunks");
            const parts = [];
            for (let i = 0; i < totalChunks.length; i++) {
              const data = yield fetchData({
                path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
                apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
                body: {
                  objectKey: res === null || res === void 0 ? void 0 : res.key,
                  uploadId: res === null || res === void 0 ? void 0 : res.uploadId,
                  partNumber: i + 1,
                },
                throwError: true,
              });
              console.log(data, "data for signed url");
              const val = yield axios.put(data === null || data === void 0 ? void 0 : data.url, totalChunks[i], {
                headers: { "Content-Type": file.type, "X-Api-Key": __classPrivateFieldGet(this, _FileUpload_accessKey, "f") },
              });
              parts.push({ PartNumber: i + 1, ETag: '"958057f9cd1d264e94fcc0d2ccabc09f"' });
              console.log(val === null || val === void 0 ? void 0 : val.data, "after uploading");
            }
            console.log(parts, "parts");
            const completeValue = yield fetchData({
              path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
              apiKey: __classPrivateFieldGet(this, _FileUpload_accessKey, "f"),
              body: {
                uploadId: res === null || res === void 0 ? void 0 : res.uploadId,
                objectKey: res === null || res === void 0 ? void 0 : res.key,
                parts,
                originalFileName: file.name,
              },
              throwError: true,
            });
            console.log(completeValue, "after complete");
            resolve({ message: "successfully uploaded", data: completeValue });
          } catch (error) {
            reject(error);
          }
        })
      );
    });
  }
}
(_FileUpload_uppyIns = new WeakMap()), (_FileUpload_accessKey = new WeakMap());
export default FileUpload;
