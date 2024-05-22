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
var _PoseDetection_socketRef, _PoseDetection_accessKey;
import { io } from "socket.io-client";
import { APP_POSE_DETECTION_WEbSOCKET_URL } from "./constants.js";
/**
 * Class representing pose detection functionality.
 */
var PoseDetection = /** @class */ (function () {
    /**
     * Constructs a new instance of the PoseDetection class.
     * @param {string} accessKey - The access key used for authentication.
     */
    function PoseDetection(accessKey) {
        _PoseDetection_socketRef.set(this, null);
        _PoseDetection_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _PoseDetection_accessKey, accessKey, "f");
    }
    /**
     * Connects to the pose detection WebSocket server.
     * @returns {Promise<string>} - A promise that resolves with the socket ID on successful connection.
     */
    PoseDetection.prototype.connect = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a, _b;
            __classPrivateFieldSet(_this, _PoseDetection_socketRef, io.connect(APP_POSE_DETECTION_WEbSOCKET_URL), "f");
            (_a = __classPrivateFieldGet(_this, _PoseDetection_socketRef, "f")) === null || _a === void 0 ? void 0 : _a.on("connect", function () {
                resolve(__classPrivateFieldGet(_this, _PoseDetection_socketRef, "f").id);
            });
            (_b = __classPrivateFieldGet(_this, _PoseDetection_socketRef, "f")) === null || _b === void 0 ? void 0 : _b.on("connect_error", function (err) { return reject(err); });
        });
    };
    /**
     * Emits a video frame to the pose detection server.
     * @param {Object} params - The parameters for emitting the video frame.
     * @param {string} params.image - The image data.
     * @param {string} params.scanId - The unique scan ID.
     * @throws {Error} - If the socket is not connected.
     */
    PoseDetection.prototype.videoEmit = function (_a) {
        var image = _a.image, scanId = _a.scanId;
        if (!__classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) {
            throw new Error("Socket is not connected");
        }
        __classPrivateFieldGet(this, _PoseDetection_socketRef, "f").emit("video", {
            image: image,
            user_unique_key: scanId,
        });
    };
    /**
     * Disconnects from the pose detection WebSocket server.
     */
    PoseDetection.prototype.disconnect = function () {
        var _a, _b;
        (_b = (_a = __classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) === null || _a === void 0 ? void 0 : _a.disconnect) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    /**
     * Registers a callback function to handle pose status updates.
     * @param {function} callBack - The callback function to handle pose status updates.
     * @throws {Error} - If the socket is not connected.
     */
    PoseDetection.prototype.poseStatus = function (callBack) {
        if (!__classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) {
            throw new Error("Socket is not connected");
        }
        __classPrivateFieldGet(this, _PoseDetection_socketRef, "f").on("pose_status", function (data) {
            callBack === null || callBack === void 0 ? void 0 : callBack(data);
        });
    };
    /**
     * Checks if the socket is connected.
     * @returns {boolean} - True if the socket is connected, false otherwise.
     */
    PoseDetection.prototype.connected = function () {
        var _a;
        return !!((_a = __classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) === null || _a === void 0 ? void 0 : _a.connected);
    };
    return PoseDetection;
}());
_PoseDetection_socketRef = new WeakMap(), _PoseDetection_accessKey = new WeakMap();
export default PoseDetection;
