"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_js_1 = __importDefault(require("./auth.js"));
const custom_js_1 = __importDefault(require("./custom.js"));
const fileUpload_js_1 = __importDefault(require("./fileUpload.js"));
const measurement_js_1 = __importDefault(require("./measurement.js"));
const poseDetection_js_1 = __importDefault(require("./poseDetection.js"));
const tryOn_js_1 = __importDefault(require("./tryOn.js"));
class Swan {
    #accessKey;
    auth;
    custom;
    fileUpload;
    measurement;
    poseDetection;
    tryOn;
    constructor(accessKey) {
        this.#accessKey = accessKey;
        this.auth = new auth_js_1.default(this.#accessKey);
        this.custom = new custom_js_1.default(this.#accessKey);
        this.fileUpload = new fileUpload_js_1.default(this.#accessKey);
        this.measurement = new measurement_js_1.default(this.#accessKey);
        this.poseDetection = new poseDetection_js_1.default(this.#accessKey);
        this.tryOn = new tryOn_js_1.default(this.#accessKey);
    }
}
exports.default = Swan;
