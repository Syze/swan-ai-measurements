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
import { APP_POSE_DETECTION_WEBSOCKET_URL } from "./constants.js";
class PoseDetection {
    constructor(accessKey) {
        _PoseDetection_socketRef.set(this, null);
        _PoseDetection_accessKey.set(this, void 0);
        __classPrivateFieldSet(this, _PoseDetection_accessKey, accessKey, "f");
    }
    connect() {
        return new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _PoseDetection_socketRef, io(APP_POSE_DETECTION_WEBSOCKET_URL, {
                auth: {
                    token: __classPrivateFieldGet(this, _PoseDetection_accessKey, "f"),
                },
            }), "f");
            __classPrivateFieldGet(this, _PoseDetection_socketRef, "f").on("connect", () => {
                var _a;
                const socketId = (_a = __classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) === null || _a === void 0 ? void 0 : _a.id;
                if (socketId) {
                    resolve(socketId);
                }
                else {
                    reject(new Error("Failed to obtain socket ID."));
                }
            });
            __classPrivateFieldGet(this, _PoseDetection_socketRef, "f").on("connect_error", (err) => {
                reject(err);
            });
        });
    }
    videoEmit({ image, scanId }) {
        if (!__classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) {
            throw new Error("Socket is not connected");
        }
        __classPrivateFieldGet(this, _PoseDetection_socketRef, "f").emit("video", {
            image,
            user_unique_key: scanId,
        });
    }
    disconnect() {
        var _a;
        (_a = __classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) === null || _a === void 0 ? void 0 : _a.disconnect();
    }
    poseStatus(callBack) {
        if (!__classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) {
            throw new Error("Socket is not connected");
        }
        __classPrivateFieldGet(this, _PoseDetection_socketRef, "f").on("pose_status", (data) => {
            callBack === null || callBack === void 0 ? void 0 : callBack(data);
        });
    }
    connected() {
        var _a;
        return !!((_a = __classPrivateFieldGet(this, _PoseDetection_socketRef, "f")) === null || _a === void 0 ? void 0 : _a.connected);
    }
}
_PoseDetection_socketRef = new WeakMap(), _PoseDetection_accessKey = new WeakMap();
export default PoseDetection;
