import { APP_POSE_DETECTION_WEbSOCKET_URL } from "./constants.js";
import { io } from "socket.io-client";

export default class PoseDetection {
  static socket = null;
  static accessKey;
  constructor(key) {
    PoseDetection.accessKey = key;
  }
  connect() {
    return new Promise((resolve, reject) => {
      PoseDetection.socket = io.connect(APP_POSE_DETECTION_WEbSOCKET_URL);
      PoseDetection.socket?.on("connect", () => {
        resolve(PoseDetection.socket.id); // "G5p5..."
      });
      PoseDetection.socket?.on("connect_error", (err) => reject(err));
    });
  }

  videoEmit({ image, scanId }) {
    if (!PoseDetection.socket) {
      throw new Error("socket is not connected");
    }
    PoseDetection.socket.emit("video", {
      image,
      user_unique_key: scanId,
    });
  }

  disconnect() {
    PoseDetection.socket?.disconnect?.();
  }

  poseStatus(callBack) {
    if (!PoseDetection.socket) {
      throw new Error("socket is not connected");
    }
    PoseDetection.socket.on("pose_status", (data) => {
      callBack(data);
    });
  }

  connected() {
    return !!PoseDetection.socket?.connected;
  }
}
