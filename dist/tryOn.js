import axios from "axios";
import { API_ENDPOINTS, APP_AUTH_BASE_URL, APP_AUTH_WEBSOCKET_URL, REQUIRED_MESSAGE } from "./constants.js";
import { checkParameters } from "./utils.js";
class TryOn {
    #tryOnSocketRef = null;
    #timerWaitingRef = null;
    #accessKey;
    /**
     * Constructs a new instance of the TryOn class.
     * @param {string} accessKey - The access key used for authentication.
     */
    constructor(accessKey) {
        this.#accessKey = accessKey;
    }
    /**
     * Uploads files to the server.
     * @param {Object} params - The parameters for uploading the files.
     * @param {File[]} params.files - The files to be uploaded.
     * @param {string} params.userId - The user ID.
     * @returns {Promise<string>} - A promise that resolves with a success message.
     */
    uploadFile({ files, userId }) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = {
                    userId,
                    userImages: [files?.[0]?.name],
                };
                if (files?.[1]) {
                    payload.userImages.push(files?.[1]?.name);
                }
                const signedUrlRes = await this.#getSignedUrl(payload);
                for (const file of files) {
                    await this.#s3Upload(signedUrlRes?.data?.uploadUrls?.[file.name]?.url, file);
                }
                resolve("uploaded successfully!");
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Gets the signed URL for uploading files.
     * @param {Object} payload - The payload for the request.
     * @returns {Promise<Object>} - A promise that resolves with the signed URL response.
     * @private
     */
    #getSignedUrl(payload) {
        return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_UPLOAD}`, payload, {
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": this.#accessKey,
            },
        });
    }
    /**
     * Uploads a file to S3.
     * @param {string} url - The signed URL for uploading the file.
     * @param {File} file - The file to be uploaded.
     * @returns {Promise<Object>} - A promise that resolves with the upload response.
     * @private
     */
    #s3Upload(url, file) {
        return axios.put(url, file, {
            headers: {
                "Content-Type": file.type,
            },
        });
    }
    /**
     * Retrieves uploaded files for a user.
     * @param {string} userId - The user ID.
     * @returns {Promise<Object>} - A promise that resolves with the uploaded files response.
     * @throws {Error} - If the parameters are invalid.
     */
    getUploadedFiles(userId) {
        if (checkParameters(userId) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.post(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_DOWNLOAD}?userId=${userId}`, null, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    /**
     * Deletes an uploaded image for a user.
     * @param {Object} params - The parameters for deleting the image.
     * @param {string} params.userId - The user ID.
     * @param {string} params.fileName - The name of the file to be deleted.
     * @returns {Promise<Object>} - A promise that resolves with the delete response.
     * @throws {Error} - If the parameters are invalid.
     */
    deleteImage({ userId, fileName }) {
        if (checkParameters(userId, fileName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return axios.delete(`${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_IMAGE_URLS}?userId=${userId}&file=${fileName}`, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    }
    /**
     * Disconnects the WebSocket and clears the timeout.
     * @private
     */
    #disconnectSocket = () => {
        this.#tryOnSocketRef?.close();
        clearTimeout(this.#timerWaitingRef);
    };
    /**
     * Handles the timeout for the try-on process.
     * @param {Object} params - The parameters for the timeout handler.
     * @param {function} params.onSuccess - The success callback (optional).
     * @param {function} params.onError - The error callback (optional).
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.userId - The user ID.
     * @param {string} params.productName - The product name.
     * @private
     */
    #handleTimeOut = ({ onSuccess, onError, shopDomain, userId, productName }) => {
        this.#timerWaitingRef = setTimeout(() => {
            this.#handleGetTryOnResult({ shopDomain, userId, productName, onSuccess, onError });
            this.#disconnectSocket();
        }, 120000);
    };
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
    handleTryOnWebSocket = ({ shopDomain, userId, productName, onError, onSuccess, onClose, onOpen }) => {
        if (checkParameters(shopDomain, userId, productName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        this.#disconnectSocket();
        const url = `${APP_AUTH_WEBSOCKET_URL}${API_ENDPOINTS.TRY_ON}/?store_url=${shopDomain}&product_name=${productName}&scan_id=${userId}`;
        this.#tryOnSocketRef = new WebSocket(url);
        this.#tryOnSocketRef.onopen = async () => {
            onOpen?.();
            this.#handleTimeOut({ onSuccess, onError, shopDomain, userId, productName });
            try {
                await this.handleForLatestImage({ shopDomain, userId, productName });
            }
            catch (error) {
                onError?.(error);
            }
        };
        this.#tryOnSocketRef.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data?.status === "success") {
                this.#handleGetTryOnResult({ shopDomain, userId, productName, onError, onSuccess });
            }
            else {
                onError?.(data);
            }
            clearTimeout(this.#timerWaitingRef);
        };
        this.#tryOnSocketRef.onclose = () => {
            onClose?.();
        };
        this.#tryOnSocketRef.onerror = (event) => {
            onError?.(event);
            clearTimeout(this.#timerWaitingRef);
        };
    };
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
    handleForLatestImage = async ({ userId, shopDomain, productName, onError }) => {
        if (checkParameters(shopDomain, userId, productName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        return new Promise(async (resolve, reject) => {
            try {
                const url = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON}/?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
                const res = await axios.post(url, {
                    headers: { "X-Api-Key": this.#accessKey },
                });
                if (res?.data?.tryOnProcessStatus === "failed") {
                    this.#disconnectSocket();
                    reject(res?.data);
                }
                else {
                    resolve(res?.data);
                }
            }
            catch (error) {
                onError?.(error);
                this.#disconnectSocket();
                reject(error);
            }
        });
    };
    /**
     * Handles the result of the try-on process.
     * @param {Object} params - The parameters for handling the try-on result.
     * @param {function} params.onSuccess - The success callback.
     * @param {function} params.onError - The error callback.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.userId - The user ID.
     * @param {string} params.productName - The product name.
     * @private
     */
    #handleGetTryOnResult = async ({ onSuccess, onError, shopDomain, userId, productName }) => {
        try {
            const data = await this.getTryOnResult({ shopDomain, userId, productName });
            onSuccess?.(data?.data);
        }
        catch (error) {
            onError?.(error);
        }
    };
    /**
     * Retrieves the try-on result.
     * @param {Object} params - The parameters for fetching the try-on result.
     * @param {string} params.userId - The user ID.
     * @param {string} params.shopDomain - The shop domain.
     * @param {string} params.productName - The product name.
     * @returns {Promise} - The axios response promise.
     * @throws {Error} - If the required parameters are missing.
     */
    getTryOnResult = ({ userId, shopDomain, productName }) => {
        if (checkParameters(shopDomain, userId, productName) === false) {
            throw new Error(REQUIRED_MESSAGE);
        }
        const url = `${APP_AUTH_BASE_URL}${API_ENDPOINTS.TRY_ON_RESULT_IMAGE_DOWNLOAD}?scan_id=${userId}&store_url=${shopDomain}&product_name=${productName}`;
        return axios.post(url, null, {
            headers: { "X-Api-Key": this.#accessKey },
        });
    };
}
export default TryOn;
