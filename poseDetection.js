import { APP_POSE_DETECTION_WEbSOCKET_URL } from "./constants.js";
import { io } from "socket.io-client";

export default class PoseDetection {
  static socket = null;

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io.connect(APP_POSE_DETECTION_WEbSOCKET_URL);
      this.socket?.on("connect", () => {
        resolve(this.socket.id); // "G5p5..."
      });
      this.socket?.on("connect_error", (err) => reject(err));
    });
  }

  videoEmit({ image, scanId }) {
    if (!this.socket) {
      throw new Error("socket is not connected");
    }
    this.socket.emit("video", {
      image,
      user_unique_key: scanId,
    });
  }

  disconnect() {
    this.socket?.disconnect?.();
  }

  poseStatus(callBack) {
    if (!this.socket) {
      throw new Error("socket is not connected");
    }
    this.socket.on("pose_status", (data) => {
      callBack(data);
    });
  }

  connected() {
    return !!this.socket?.connected;
  }
}
