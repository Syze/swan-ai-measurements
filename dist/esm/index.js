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
var _Swan_accessKey;
import Auth from "./auth";
import Custom from "./custom";
import FileUpload from "./fileUpload";
import Measurement from "./measurement";
import PoseDetection from "./poseDetection";
import TryOn from "./tryOn";
class Swan {
    constructor(accessKey) {
        _Swan_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _Swan_accessKey, accessKey, "f");
        this.auth = new Auth(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.custom = new Custom(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.fileUpload = new FileUpload(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.measurement = new Measurement(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.poseDetection = new PoseDetection(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.tryOn = new TryOn(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
    }
}
_Swan_accessKey = new WeakMap();
export default Swan;
