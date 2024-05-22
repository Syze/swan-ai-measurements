export default Measurement;
/**
 * Class representing measurement-related functionality.
 */
declare class Measurement {
    /**
     * Constructs a new instance of the Measurement class.
     * @param {string} accessKey - The access key used for authentication.
     */
    constructor(accessKey: string);
    /**
     * Retrieves the measurement status for a given scan ID.
     * @param {string} scanId - The ID of the scan.
     * @returns {Promise} - The axios response promise.
     * @throws {Error} - If the required parameter is missing.
     */
    getMeasurementStatus(scanId: string): Promise<any>;
    /**
     * Retrieves the try-on measurements for a given scan ID, shop domain, and product name.
     * @param {Object} params - The parameters for the try-on measurements.
     * @param {string} params.scanId - The ID of the scan.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.productName - The product name.
     * @returns {Promise} - The axios response promise.
     * @throws {Error} - If the required parameters are missing.
     */
    getTryOnMeasurements({ scanId, shopDomain, productName }: {
        scanId: string;
        shopDomain: string;
        productName: string;
    }): Promise<any>;
    /**
     * Handles the try-on WebSocket connection.
     * @param {Object} params - The parameters for the WebSocket connection.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.scanId - The ID of the scan.
     * @param {string} params.productName - The product name.
     * @param {function} [params.onError] - Optional. Callback function to handle errors.
     * @param {function} [params.onSuccess] - Optional. Callback function to handle successful messages.
     * @param {function} [params.onClose] - Optional. Callback function to handle WebSocket close event.
     * @param {function} [params.onOpen] - Optional. Callback function to handle WebSocket open event.
     */
    handleTryOnSocket({ shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen }: {
        shopDomain: string;
        scanId: string;
        productName: string;
        onError?: Function | undefined;
        onSuccess?: Function | undefined;
        onClose?: Function | undefined;
        onOpen?: Function | undefined;
    }): void;
    /**
     * Handles the measurement WebSocket connection.
     * @param {Object} params - The parameters for the WebSocket connection.
     * @param {string} params.scanId - The ID of the scan.
     * @param {function} [params.onError] - Optional. Callback function to handle errors.
     * @param {function} [params.onSuccess] - Optional. Callback function to handle successful messages.
     * @param {function} [params.onClose] - Optional. Callback function to handle WebSocket close event.
     * @param {function} [params.onOpen] - Optional. Callback function to handle WebSocket open event.
     */
    handleMeasurementSocket({ scanId, onError, onSuccess, onClose, onOpen }: {
        scanId: string;
        onError?: Function | undefined;
        onSuccess?: Function | undefined;
        onClose?: Function | undefined;
        onOpen?: Function | undefined;
    }): void;
    #private;
}
