import { io } from "socket.io-client";
import { APP_POSE_DETECTION_WEBSOCKET_URL } from "./constants.js";
class PoseDetection {
    #socketRef = null;
    #accessKey;
    constructor(accessKey) {
        this.#accessKey = accessKey;
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.#socketRef = io(APP_POSE_DETECTION_WEBSOCKET_URL, {
                auth: {
                    token: this.#accessKey,
                },
            });
            this.#socketRef.on("connect", () => {
                const socketId = this.#socketRef?.id;
                if (socketId) {
                    resolve(socketId);
                }
                else {
                    reject(new Error("Failed to obtain socket ID."));
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
export default PoseDetection;
