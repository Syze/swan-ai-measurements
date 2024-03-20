import { APP_POSE_DETECTION_WEbSOCKET_URL } from "./constants.js";
import { io } from "socket.io-client";
let socket;

export function handlePoseDetectionSocket() {
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
      if (!socket) {
        throw new Error("socket is not connected");
      }
      socket.emit("video", {
        image,
        user_unique_key: scanId,
      });
    },

    disconnect: function () {
      if (socket) {
        socket.disconnect();
      }
    },

    poseStatus: function (callBack) {
      if (!socket) {
        throw new Error("socket is not connected");
      }
      socket.on("pose_status", (data) => {
        console.log(data);
        callBack(data);
      });
    },

    connected: function () {
      if (!socket) {
        return false;
      }
      return socket.connected;
    },
  };
}
