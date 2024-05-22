"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Swan_accessKey;
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("./auth"));
const custom_1 = __importDefault(require("./custom"));
const fileUpload_1 = __importDefault(require("./fileUpload"));
const measurement_1 = __importDefault(require("./measurement"));
const poseDetection_1 = __importDefault(require("./poseDetection"));
const tryOn_1 = __importDefault(require("./tryOn"));
class Swan {
    constructor(accessKey) {
        _Swan_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _Swan_accessKey, accessKey, "f");
        this.auth = new auth_1.default(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.custom = new custom_1.default(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.fileUpload = new fileUpload_1.default(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.measurement = new measurement_1.default(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.poseDetection = new poseDetection_1.default(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.tryOn = new tryOn_1.default(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
    }
}
_Swan_accessKey = new WeakMap();
exports.default = Swan;
