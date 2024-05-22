export default PoseDetection;
/**
 * Class representing pose detection functionality.
 */
declare class PoseDetection {
    /**
     * Constructs a new instance of the PoseDetection class.
     * @param {string} accessKey - The access key used for authentication.
     */
    constructor(accessKey: string);
    /**
     * Connects to the pose detection WebSocket server.
     * @returns {Promise<string>} - A promise that resolves with the socket ID on successful connection.
     */
    connect(): Promise<string>;
    /**
     * Emits a video frame to the pose detection server.
     * @param {Object} params - The parameters for emitting the video frame.
     * @param {string} params.image - The image data.
     * @param {string} params.scanId - The unique scan ID.
     * @throws {Error} - If the socket is not connected.
     */
    videoEmit({ image, scanId }: {
        image: string;
        scanId: string;
    }): void;
    /**
     * Disconnects from the pose detection WebSocket server.
     */
    disconnect(): void;
    /**
     * Registers a callback function to handle pose status updates.
     * @param {function} callBack - The callback function to handle pose status updates.
     * @throws {Error} - If the socket is not connected.
     */
    poseStatus(callBack: Function): void;
    /**
     * Checks if the socket is connected.
     * @returns {boolean} - True if the socket is connected, false otherwise.
     */
    connected(): boolean;
    #private;
}
