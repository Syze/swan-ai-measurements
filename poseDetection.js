import { APP_POSE_DETECTION_WEbSOCKET_URL } from "./constants.js";
import { io } from "socket.io-client";
let socket;

export function handlePoseDetectionSocket() {
  if (socket) {
    socket.close();
  }
  return {
    connect: function () {
      return new Promise((resolve, reject) => {
        socket = io.connect(APP_POSE_DETECTION_WEbSOCKET_URL);
        socket.on("connect", () => {
          resolve(socket.id); // "G5p5..."
        });
        socket.on("connect_error", (err) => reject(err));
      });
    },

    videoEmit: function ({ image, scanId }) {
      socket.emit("video", {
        image,
        user_unique_key: scanId,
      });
    },

    disconnect: function () {
      socket.disconnect();
    },

    poseStatus: function (callBack) {
      socket.on("pose_status", callBack(data));
    },
  };
}
