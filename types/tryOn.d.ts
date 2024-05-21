export = TryOn;
declare class TryOn {
    /**
     * Constructs a new instance of the TryOn class.
     * @param {string} accessKey - The access key used for authentication.
     */
    constructor(accessKey: string);
    /**
     * Uploads files to the server.
     * @param {Object} params - The parameters for uploading the files.
     * @param {File[]} params.files - The files to be uploaded.
     * @param {string} params.userId - The user ID.
     * @returns {Promise<string>} - A promise that resolves with a success message.
     */
    uploadFile({ files, userId }: {
        files: File[];
        userId: string;
    }): Promise<string>;
    /**
     * Retrieves uploaded files for a user.
     * @param {string} userId - The user ID.
     * @returns {Promise<Object>} - A promise that resolves with the uploaded files response.
     * @throws {Error} - If the parameters are invalid.
     */
    getUploadedFiles(userId: string): Promise<any>;
    /**
     * Deletes an uploaded image for a user.
     * @param {Object} params - The parameters for deleting the image.
     * @param {string} params.userId - The user ID.
     * @param {string} params.fileName - The name of the file to be deleted.
     * @returns {Promise<Object>} - A promise that resolves with the delete response.
     * @throws {Error} - If the parameters are invalid.
     */
    deleteImage({ userId, fileName }: {
        userId: string;
        fileName: string;
    }): Promise<any>;
    /**
     * Handles the WebSocket connection for the try-on process.
     * @param {Object} params - The parameters for the WebSocket handler.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.userId - The user ID.
     * @param {string} params.productName - The product name.
     * @param {function} [params.onError] - The error callback (optional).
     * @param {function} [params.onSuccess] - The success callback (optional).
     * @param {function} [params.onClose] - The close callback (optional).
     * @param {function} [params.onOpen] - The open callback (optional).
     * @throws {Error} - If the required parameters are missing.
     */
    handleTryOnWebSocket: ({ shopDomain, userId, productName, onError, onSuccess, onClose, onOpen }: {
        shopDomain: string;
        userId: string;
        productName: string;
        onError?: Function;
        onSuccess?: Function;
        onClose?: Function;
        onOpen?: Function;
    }) => void;
    /**
     * Handles getting the latest image for the try-on process.
     * @param {Object} params - The parameters for getting the latest image.
     * @param {string} params.userId - The user ID.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.productName - The product name.
     * @param {function} params.onError - The error callback (optional).
     * @returns {Promise<Object>} - A promise that resolves with the latest image data.
     * @throws {Error} - If the parameters are invalid.
     */
    handleForLatestImage: ({ userId, shopDomain, productName, onError }: {
        userId: string;
        shopDomain: string;
        productName: string;
        onError: Function;
    }) => Promise<any>;
    /**
     * Retrieves the try-on result.
     * @param {Object} params - The parameters for fetching the try-on result.
     * @param {string} params.userId - The user ID.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.productName - The product name.
     * @returns {Promise} - The axios response promise.
     * @throws {Error} - If the required parameters are missing.
     */
    getTryOnResult: ({ userId, shopDomain, productName }: {
        userId: string;
        shopDomain: string;
        productName: string;
    }) => Promise<any>;
    #private;
}
