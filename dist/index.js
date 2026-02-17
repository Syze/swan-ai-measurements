"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_js_1 = __importDefault(require("./auth.js"));
const custom_js_1 = __importDefault(require("./custom.js"));
const enum_js_1 = require("./enum.js");
const fileUpload_js_1 = __importDefault(require("./fileUpload.js"));
const measurement_js_1 = __importDefault(require("./measurement.js"));
const poseDetection_js_1 = __importDefault(require("./poseDetection.js"));
const tryOn_js_1 = __importDefault(require("./tryOn.js"));
class Swan {
    #accessKey;
    #urlType;
    #token;
    auth;
    custom;
    fileUpload;
    measurement;
    poseDetection;
    tryOn;
    constructor(accessKey, urlType = enum_js_1.URLType.PROD, token) {
        this.#accessKey = accessKey;
        this.#urlType = urlType;
        this.#token = token;
        this.auth = new auth_js_1.default(this.#accessKey, this.#urlType, this.#token);
        this.custom = new custom_js_1.default(this.#accessKey, this.#urlType, this.#token);
        this.fileUpload = new fileUpload_js_1.default(this.#accessKey, this.#urlType, this.#token);
        this.measurement = new measurement_js_1.default(this.#accessKey, this.#urlType, this.#token);
        this.poseDetection = new poseDetection_js_1.default(this.#accessKey, this.#urlType, this.#token);
        this.tryOn = new tryOn_js_1.default(this.#accessKey, this.#urlType, this.#token);
    }
}
exports.default = Swan;
