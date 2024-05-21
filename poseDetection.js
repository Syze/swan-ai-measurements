const { APP_POSE_DETECTION_WEBSOCKET_URL, REQUIRED_MESSAGE } = require("./constants.js");
const io = require("socket.io-client");

/**
 * Class representing pose detection functionality.
 */
class PoseDetection {
  #socketRef = null;
  #accessKey;

  /**
   * Constructs a new instance of the PoseDetection class.
   * @param {string} accessKey - The access key used for authentication.
   */
  constructor(accessKey) {
    this.#accessKey = accessKey;
  }

  /**
   * Connects to the pose detection WebSocket server.
   * @returns {Promise<string>} - A promise that resolves with the socket ID on successful connection.
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.#socketRef = io.connect(APP_POSE_DETECTION_WEBSOCKET_URL);
      this.#socketRef?.on("connect", () => {
        resolve(this.#socketRef.id);
      });
      this.#socketRef?.on("connect_error", (err) => reject(err));
    });
  }

  /**
   * Emits a video frame to the pose detection server.
   * @param {Object} params - The parameters for emitting the video frame.
   * @param {string} params.image - The image data.
   * @param {string} params.scanId - The unique scan ID.
   * @throws {Error} - If the socket is not connected.
   */
  videoEmit({ image, scanId }) {
    if (!this.#socketRef) {
      throw new Error("Socket is not connected");
    }
    this.#socketRef.emit("video", {
      image,
      user_unique_key: scanId,
    });
  }

  /**
   * Disconnects from the pose detection WebSocket server.
   */
  disconnect() {
    this.#socketRef?.disconnect?.();
  }

  /**
   * Registers a callback function to handle pose status updates.
   * @param {function} callBack - The callback function to handle pose status updates.
   * @throws {Error} - If the socket is not connected.
   */
  poseStatus(callBack) {
    if (!this.#socketRef) {
      throw new Error("Socket is not connected");
    }
    this.#socketRef.on("pose_status", (data) => {
      callBack?.(data);
    });
  }

  /**
   * Checks if the socket is connected.
   * @returns {boolean} - True if the socket is connected, false otherwise.
   */
  connected() {
    return !!this.#socketRef?.connected;
  }
}

module.exports = PoseDetection;
