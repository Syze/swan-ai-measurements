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
var _Swan_accessKey;
var Auth = require("./auth.js");
var Custom = require("./custom.js");
var FileUpload = require("./fileUpload.js");
var Measurement = require("./measurement.js");
var PoseDetection = require("./poseDetection.js");
var TryOn = require("./tryOn.js");
var Swan = /** @class */ (function () {
    function Swan(accessKey) {
        _Swan_accessKey.set(this, void 0);
        this.auth = new Auth(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.custom = new Custom(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.fileUpload = new FileUpload(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.measurement = new Measurement(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.poseDetection = new PoseDetection(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        this.tryOn = new TryOn(__classPrivateFieldGet(this, _Swan_accessKey, "f"));
        __classPrivateFieldSet(this, _Swan_accessKey, accessKey, "f");
    }
    return Swan;
}());
_Swan_accessKey = new WeakMap();
module.exports = Swan;
