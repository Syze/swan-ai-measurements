import { APP_POSE_DETECTION_WEbSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { io } from "socket.io-client";

export default class PoseDetection {
  #socketRef = null;

  connect(accessKey) {
    if (!accessKey) {
      throw new Error(REQUIRED_MESSAGE);
    }
    return new Promise((resolve, reject) => {
      this.#socketRef = io.connect(APP_POSE_DETECTION_WEbSOCKET_URL);
      this.#socketRef?.on("connect", () => {
        resolve(this.#socketRef.id); // "G5p5..."
      });
      this.#socketRef?.on("connect_error", (err) => reject(err));
    });
  }

  videoEmit({ image, scanId, accessKey }) {
    if (!accessKey) {
      throw new Error(REQUIRED_MESSAGE);
    }

    if (!this.#socketRef) {
      throw new Error("socket is not connected");
    }
    this.#socketRef.emit("video", {
      image,
      user_unique_key: scanId,
    });
  }

  disconnect() {
    this.#socketRef?.disconnect?.();
  }

  poseStatus(accessKey, callBack) {
    if (!accessKey) {
      throw new Error(REQUIRED_MESSAGE);
    }
    if (!this.#socketRef) {
      throw new Error("socket is not connected");
    }
    this.#socketRef.on("pose_status", (data) => {
      callBack?.(data);
    });
  }

  connected() {
    return !!this.#socketRef?.connected;
  }
}
