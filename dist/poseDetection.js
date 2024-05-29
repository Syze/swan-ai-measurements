"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const constants_js_1 = require("./constants.js");
const utils_js_1 = require("./utils.js");
class PoseDetection {
    #socketRef = null;
    #accessKey;
    #stagingUrl;
    constructor(accessKey, stagingUrl = false) {
        this.#accessKey = accessKey;
        this.#stagingUrl = stagingUrl;
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.#socketRef = (0, socket_io_client_1.io)((0, utils_js_1.getUrl)({ urlName: constants_js_1.APP_POSE_DETECTION_WEBSOCKET_URL, stagingUrl: this.#stagingUrl }));
            this.#socketRef.on("connect", () => {
                const socketId = this.#socketRef?.id;
                if (socketId) {
                    resolve(socketId);
                }
                else {
                    reject("Failed to obtain socket ID.");
                }
            });
            this.#socketRef.on("connect_error", (err) => {
                reject(err);
            });
        });
    }
    videoEmit({ image, scanId }) {
        if (!this.#socketRef) {
            throw new Error("Socket is not connected");
        }
        this.#socketRef.emit("video", {
            image,
            user_unique_key: scanId,
        });
    }
    disconnect() {
        this.#socketRef?.disconnect();
    }
    poseStatus(callBack) {
        if (!this.#socketRef) {
            throw new Error("Socket is not connected");
        }
        this.#socketRef.on("pose_status", (data) => {
            callBack?.(data);
        });
    }
    connected() {
        return !!this.#socketRef?.connected;
    }
}
exports.default = PoseDetection;
