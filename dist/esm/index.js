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
var _Swan_accessKey, _Swan_stagingUrl;
import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";
class Swan {
    constructor(accessKey, stagingUrl = false) {
        _Swan_accessKey.set(this, void 0);
        _Swan_stagingUrl.set(this, void 0);
        __classPrivateFieldSet(this, _Swan_accessKey, accessKey, "f");
        __classPrivateFieldSet(this, _Swan_stagingUrl, stagingUrl, "f");
        this.auth = new Auth(__classPrivateFieldGet(this, _Swan_accessKey, "f"), __classPrivateFieldGet(this, _Swan_stagingUrl, "f"));
        this.custom = new Custom(__classPrivateFieldGet(this, _Swan_accessKey, "f"), __classPrivateFieldGet(this, _Swan_stagingUrl, "f"));
        this.fileUpload = new FileUpload(__classPrivateFieldGet(this, _Swan_accessKey, "f"), __classPrivateFieldGet(this, _Swan_stagingUrl, "f"));
        this.measurement = new Measurement(__classPrivateFieldGet(this, _Swan_accessKey, "f"), __classPrivateFieldGet(this, _Swan_stagingUrl, "f"));
        this.poseDetection = new PoseDetection(__classPrivateFieldGet(this, _Swan_accessKey, "f"), __classPrivateFieldGet(this, _Swan_stagingUrl, "f"));
        this.tryOn = new TryOn(__classPrivateFieldGet(this, _Swan_accessKey, "f"), __classPrivateFieldGet(this, _Swan_stagingUrl, "f"));
    }
}
_Swan_accessKey = new WeakMap(), _Swan_stagingUrl = new WeakMap();
export default Swan;
