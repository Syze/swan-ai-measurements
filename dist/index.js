"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("./auth"));
const custom_1 = __importDefault(require("./custom"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
const measurement_1 = __importDefault(require("./measurement"));
const poseDetection_1 = __importDefault(require("./poseDetection"));
const tryOn_1 = __importDefault(require("./tryOn"));
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
        this.auth = new auth_1.default(this.#accessKey);
        this.custom = new custom_1.default(this.#accessKey);
        this.fileUpload = new fileUpload_1.default(this.#accessKey);
        this.measurement = new measurement_1.default(this.#accessKey);
        this.poseDetection = new poseDetection_1.default(this.#accessKey);
        this.tryOn = new tryOn_1.default(this.#accessKey);
    }
}
exports.default = Swan;
