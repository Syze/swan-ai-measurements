import { io, Socket } from "socket.io-client";
import { APP_POSE_DETECTION_WEBSOCKET_URL } from "./constants.js";
import { getUrl } from "./utils.js";
import { URLType } from "./enum.js";


interface VideoEmitOptions {
  image: string;
  scanId: string;
}

type PoseStatusCallback = (data: any) => void;

class PoseDetection {
  #socketRef: Socket | null = null;
  #accessKey: string;
  #urlType: URLType;
  constructor(accessKey: string, urlType = URLType.PROD) {
    this.#accessKey = accessKey;
    this.#urlType = urlType;
  }

  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.#socketRef = io(getUrl({ urlName: APP_POSE_DETECTION_WEBSOCKET_URL, urlType: this.#urlType }));
      this.#socketRef.on("connect", () => {
        const socketId = this.#socketRef?.id;
        if (socketId) {
          resolve(socketId);
        } else {
          reject("Failed to obtain socket ID.");
        }
      });

      this.#socketRef.on("connect_error", (err) => {
        reject(err);
      });
    });
  }

  videoEmit({ image, scanId }: VideoEmitOptions): void {
    if (!this.#socketRef) {
      throw new Error("Socket is not connected");
    }

    this.#socketRef.emit("video", {
      image,
      user_unique_key: scanId,
    });
  }

  disconnect(): void {
    this.#socketRef?.disconnect();
  }

  poseStatus(callBack: PoseStatusCallback): void {
    if (!this.#socketRef) {
      throw new Error("Socket is not connected");
    }

    this.#socketRef.on("pose_status", (data) => {
      callBack?.(data);
    });
  }

  connected(): boolean {
    return !!this.#socketRef?.connected;
  }
}

export default PoseDetection;
